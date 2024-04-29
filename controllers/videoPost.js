const User = require('../models/user');
const VideoPost = require('../models/videoPost');
const AWS_S3 = require('../util/aws-s3');
const { getFileBaseName } = require('../util/path');
const mongoose = require('mongoose');
const fs = require('fs');

const s3 = AWS_S3.setS3Credentials;

// A function to get page and size, which used for pagination
const getPagination = (page, size) => {
  const limit = size ? +size : 4;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getSortOption = (query) => {
  const sortField = query.sortBy ? query.sortBy : 'popularity';
  const sortOrder = query.sortOrder ? parseInt(query.sortOrder) : -1;

  // _id here is to keep sort consistency
  return { [sortField]: sortOrder, _id: -1 };
};

/**
 * @api {get} /api/v1/video/:videoPostId GetVideoPost
 * @apiName GetVideoPost
 * @apiGroup VideoPost
 * @apiDescription ToB Use | get a videoPost with the videoPostId
 *
 * @apiParam {String} videoPost Id
 *
 * @apiSuccess  {Object} videoPost  the videoPost
 * @apiError Sever Error 500 with error message
 */

exports.getVideoPost = async (req, res) => {
  try {
    let videoPost = await VideoPost.findById(req.params.videoPostId)
      .populate('comments.user')
      .exec();

    if (!videoPost) {
      return res.status(404).json({
        msg: 'Cannot find the video with this videoPostId.',
      });
    }

    // only select useful user data
    let newComments = videoPost.comments.map((comment) => {
      return {
        text: comment.text,
        avatar: comment.user.profilePhoto,
        name: comment.user.userName,
        user: comment.user._id,
        date: comment.date,
      };
    });

    videoPost.comments = newComments;
    res.json(videoPost);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

/**
 * @api {post} /api/v1/video/comment/:videoPostId PostComment
 * @apiName PostComment
 * @apiGroup VideoPost
 * @apiDescription create a comment for a video post
 *
 * @apiParam {String} videoPost Id
 * *
 * @apiError Sever Error 500
 */
exports.postComment = async (req, res) => {
  try {
    const post = await VideoPost.findById(req.params.videoPostId);
    const user = await User.findById(req.userId);
    const newComment = {
      text: req.body.text,
      user: user._id,
    };

    post.comments.unshift(newComment);
    post.countComment += 1;
    await post.save();

    res.json({
      message: 'Post comment successfully!',
      post,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ err: err.message });
  }
};

/**
 * @api {post} /api/v1/video/comment/:videoPostId/:commentId DeleteComment
 * @apiName DeleteComment
 * @apiGroup VideoPost
 * @apiDescription delete a comment for a video post
 *
 * @apiParam {String} videoPost Id
 * @apiParam {String} comment Id
 *
 * @apiError Sever Error 500
 */
exports.deleteComment = async (req, res) => {
  try {
    const post = await VideoPost.findById(req.params.videoPostId);

    if (!videoPost) {
      return res.status(404).json({
        msg: 'Cannot find the video with this videoPostId.',
      });
    }

    const comment = post.comments.find(
      (comment) => comment.id === req.params.commentId,
    );

    // Check if the comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist.' });
    }

    // Check if the comment is wroten by the user
    if (comment.user.toString() !== req.userId.toString()) {
      return res.status(401).json({ msg: 'The user is not authorized.' });
    }
    // Get the removeIndex
    const removeIndex = post.comments
      .map((comment) => comment.id)
      .indexOf(req.params.commentId);

    post.comments.splice(removeIndex, 1);
    post.countComment -= 1;
    await post.save();

    res.sendStatus(200);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ err: err.message });
  }
};

/**
 * @api {get} /api/v1/video/videos?sortBy=populary     Get VideoPosts
 * @apiName Get videos, including customer's videos and business videos
 * @apiGroup VideoPost
 * @apiDescription ToC use | Get videos, including customer's videos and business videos (login is optional)
 *
 * @apiQuery sortBy    sort video posts by a field. Ex. 'distance', 'popularity'
 * @apiQuery sortOrder, sort order. 1 means ascend, -1 means descend
 * @apiQuery page      the page number
 * @apiQuery size      how many products we want to query
 * @apiQuery distance  filter by distance(mile), default is 50
 *
 * @apiSuccess  {Object[]} vidoes  Array of videos
 * @apiError Sever Error 500 with error message
 */
exports.fetchVideoPost = async (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  const sort = getSortOption(req.query);

  try {
    const videoPosts = await VideoPost.aggregate([
      {
        $addFields: {
          popularity: {
            $add: [
              { $multiply: [0.7, '$countCollections'] },
              { $multiply: [0.3, '$countLike'] },
            ],
          },
        },
      },
      { $sort: sort },
      { $skip: offset },
      { $limit: limit },
    ]);

    // generate user data
    await VideoPost.populate(videoPosts, {
      path: 'userId',
      select: ['_id', 'userId', 'userName', 'profilePhoto'],
    });

    // generate comments
    await VideoPost.populate(videoPosts, { path: 'comments.user' });
    videoPosts.map((videoPost) => {
      let newComments = videoPost.comments.map((comment) => {
        // handle account deletion case
        if (!comment.user) {
          return {
            text: comment.text,
            avatar: '',
            name: '',
            user: '',
            date: comment.date,
          };
        }
        return {
          text: comment.text,
          avatar: comment.user.profilePhoto,
          name: comment.user.userName,
          user: comment.user._id,
          date: comment.date,
        };
      });
      videoPost.comments = newComments;
    });

    res.json(videoPosts);
  } catch (err) {
    return res.status(500).json({
      errors: [
        {
          msg: 'Error loading videoPosts.',
          err: err.message,
        },
      ],
    });
  }
};

/**
 * @api {put} /api/v1/video/like/:videoPostId likeVideoPost
 * @apiGroup VideoPost
 * @apiName likeVideoPost
 * @apiDescription ToC use | used for users to like a videoPost; also, one user can only like one time for a videoPost
 *
 * @apiParam {String} videoPost Id
 *
 * @apiSuccess  {Object} Success message
 * @apiError (Error 500) Sever error message
 */
exports.likeVideoPost = async (req, res) => {
  try {
    // Check if the user exists
    let user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Can not find the user.' }] });
    }

    const videoPostId = req.params.videoPostId;
    const post = await VideoPost.findById(videoPostId);
    if (!post) {
      return res
        .status(404)
        .json({ errors: [{ message: 'post is not found.' }] });
    }
    // Check if the post is alrealy liked by the user
    // If the likes array contains the the id of current logged-in user, allow unlike
    if (
      post.likes.find(
        (like) => like.user && like.user.toString() === req.userId.toString(),
      )
    ) {
      return res.status(400).json({ msg: 'Already liked this post' });
    }

    post.likes.unshift({ user: req.userId });
    post.countLike += 1;
    user.likedVideos.push({ videoPost: videoPostId });

    await post.save();
    await user.save();
    await VideoPost.populate(post, { path: 'userId' });

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @api {put} /api/v1/video/unlike/:videoPostId unlikeVideoPost
 * @apiGroup VideoPost
 * @apiName unlikeVideoPost
 * @apiGroup VideoPost
 * @apiDescription toC use | used for users to unlike a videoPost;
 *
 * @apiParam {String} videoPost Id
 *
 * @apiSuccess  {Object} Success message
 * @apiError (Error 500) Sever error message
 */
exports.unlikeVideoPost = async (req, res) => {
  try {
    // Check if the user exists
    let user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Can not find the user.' }] });
    }

    const videoPostId = req.params.videoPostId;
    const post = await VideoPost.findById(videoPostId);
    if (!post) {
      return res
        .status(404)
        .json({ errors: [{ message: 'post is not found.' }] });
    }
    // Check if the post is alrealy liked by the user
    // If the likes array contains the the id of current logged-in user, allow unlike

    // Get the removeIndex
    const removeIndex = post.likes.map((like) => like.user).indexOf(req.userId);
    if (removeIndex === -1) {
      return res.status(400).json({ msg: 'Post has not yet been liked.' });
    }

    post.likes.splice(removeIndex, 1);
    post.countLike -= 1;

    user.likedVideos = user.likedVideos.filter(
      (video) => video.videoPost !== videoPostId,
    );

    await post.save();
    await user.save();
    await VideoPost.populate(post, { path: 'userId' });
    // The return is for development purpose only, which may be deleted in the furture
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @api {post} /api/v1/video/coverImage     Upload Video Cover Image to AWS
 * @apiName Upload cover image file to AWS
 * @apiGroup VideoPost
 * @apiDescription ToC use | update a image file
 *
 * @apiBody {File} binary image File        The image to upload
 *
 * @apiSuccess  return photo url that is stored on AWS
 * @apiError Sever Error 500 with error message
 */
exports.uploadCoverImage = async (req, res) => {
  try {
    // check if the user exists
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ errors: [{ msg: 'Can not find the user.' }] });
    }

    // Upload the image file
    let imageUrl;
    const imageParams = AWS_S3.s3CustomerCoverImageParams(req);
    const imageStored = await s3
      .upload(imageParams, (error) => {
        // Check error
        if (error) {
          return res.status(500).json({
            errors: [
              {
                msg: 'Error occured while trying to upload image to S3 bucket',
                error,
              },
            ],
          });
        }
      })
      .promise();

    // Empty uploads folder
    fs.unlinkSync(req.file.path);

    const imageFileName = getFileBaseName(imageStored.Location);
    imageUrl = AWS_S3.productImageUrlGenerator(imageFileName);

    return res.status(200).json({
      message: 'Image is uploaded successfully',
      imageUrl,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to upload image', err: err.message });
  }
};

/**
 * @api {post} /api/v1/video/upload    Upload Video to AWS
 * @apiName Upload Video file to AWS
 * @apiGroup VideoPost
 * @apiDescription ToC use | update a single video file
 *
 * @apiBody {File} binary video File   the video to upload
 *
 * @apiSuccess  return video url that is stored on AWS
 * @apiError Sever Error 500 with error message
 */
exports.uploadVideo = async (req, res) => {
  try {
    // Check if the user exists
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Can not find the user.' }] });
    }

    // Upload the video file
    let videoUrl;
    const videoParams = AWS_S3.s3CustomerVideoParams(req);
    const videoStored = await s3
      .upload(videoParams, (err) => {
        // Check error
        if (err) {
          return res.status(500).json({
            errors: [
              {
                msg: 'Error occured while trying to upload video to S3 bucket',
                err,
              },
            ],
          });
        }
      })
      .promise();

    // Empty uploads folder
    fs.unlinkSync(req.file.path);

    const videoFileName = getFileBaseName(videoStored.Location);
    videoUrl = AWS_S3.videoUrlGenerator(videoFileName);

    return res.status(200).json({
      message: 'Video is uploaded successfully',
      videoUrl,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to upload video', err: err.message });
  }
};

/**
 * @api {post} /api/v1/video/new     CreateCustomerVideo
 * @apiName Create Customer Video Post
 * @apiGroup VideoPost
 * @apiDescription ToC use | Upload Customer's video
 *
 * @apiBody {String} postTitle                the name of the video post
 * @apiBody {String} cover-image                the cover image of the video post
 * @apiBody {String} video location url         the video url
 * @apiBody {String} restaurantName           the name of the restaurant
 * @apiBody {String} orderedVia               the way the dish or video is obtained
 * @apiBody {Address} restaurantAddress       the restaurant's address
 *
 * @apiSuccess  return video url as well as the updated user object
 * @apiError Sever Error 500 with error message
 */
exports.createVideoPost = async (req, res) => {
  // // Request body Data Validation
  req
    .checkBody('postTitle')
    .exists()
    .withMessage('post Title is required')
    .notEmpty()
    .withMessage('post Title is required');
  req
    .checkBody('imageUrl')
    .exists()
    .withMessage('imageUrl is required')
    .notEmpty()
    .withMessage('Empty URL');
  req
    .checkBody('videoUrl')
    .exists()
    .withMessage('videoUrl is required')
    .notEmpty()
    .withMessage('Empty URL');
  req
    .checkBody('restaurantName')
    .notEmpty()
    .withMessage('Restaurant name should not be empty');

  const errors = req.validationErrors();
  if (errors || errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  const {
    postTitle,
    imageUrl,
    videoUrl,
    restaurantName,
    restaurantAddress,
    orderedVia,
  } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Can not find the user.' }] });
    }

    // Transaction initialized
    const session = await mongoose.startSession();

    let videoPost;
    await session
      .withTransaction(async () => {
        videoPost = new VideoPost({
          userId: user.id,
          postTitle: postTitle,
          coverImageUrl: imageUrl,
          restaurantName: restaurantName,
          restaurantAddress: restaurantAddress,
          orderedVia: orderedVia,
          videoUrl: videoUrl,
          postTime: new Date().toISOString(),
        });

        videoPost = await videoPost.save();

        user.videos.push({ videoPost: videoPost._id });
        await user.save();
      })
      .catch((err) => {
        session.endSession();
        console.log(err.message);
      });

    session.endSession();

    return res.status(200).json({
      message: 'Video post is created successfully',
      videoPost,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: 'Failed to create video post', err: err.message });
  }
};

/**
 * @api {delete} /api/v1/video/customer/:videoPostId    DeleteVideoPost
 * @apiName DeleteVideoPostForCustomer
 * @apiGroup VideoPost
 * @apiDescription ToC Use | delete a videoPost with the videoPostId
 *
 * @apiParam {String} videoPost Id
 *
 * @apiError Sever Error 500 with error message
 */
exports.deleteCustomerVideoPost = async (req, res) => {
  try {
    const videoPostId = req.params.videoPostId;
    const videoPost = await VideoPost.findById(videoPostId);
    if (!videoPost) {
      return res.status(400).json({
        msg: 'Cannot find the video with this videoPostId.',
      });
    }

    // for deletion in aws s3
    const videoPostLocationUrl = videoPost.url;
    const coverImageLocationUrl = videoPost.coverImageUrl;

    // check if the user to delete has the authority
    let toC_user = await User.findById(req.userId);

    if (toC_user && toC_user._id.toString() !== videoPost.userId.toString()) {
      return res.status(401).json({
        msg: 'No matching video found under user record.',
      });
    }

    // delete videoPost from videoPost collection
    await VideoPost.deleteOne({ _id: videoPostId });

    // delete video from user's videos
    toC_user.videos = toC_user.videos.filter(
      (video) => video.videoPost.toString() !== videoPostId,
    );

    await toC_user.save();

    let err = AWS_S3.deleteVideoInS3(videoPostLocationUrl);
    if (err) {
      return res.status(500).json({
        errors: [
          {
            msg: 'Error occured while trying to delete the video file from S3',
            err,
          },
        ],
      });
    }
    err = AWS_S3.deleteVideoInS3CoverImage(coverImageLocationUrl);
    if (err) {
      return res.status(500).json({
        errors: [
          {
            msg: 'Error occured while trying to delete the cover Image from S3',
            err,
          },
        ],
      });
    }

    res.status(200).json({
      msg: 'The video is deleted successfully and its corresponding user record updated as well.',
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
