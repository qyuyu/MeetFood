import { atom } from "jotai";
import { VideoPostItem } from "./type";

export const VideoItemsListAtom = atom<VideoPostItem[]>([]);
