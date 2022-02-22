import { db } from "../../db.js";

export const namespaced = true;

export const state = () => ({
  files: {
    // "file/path/to/thing.mp3": {
    //   filePath: "file/path/to/thing.mp3",
    //   metadata: {}
    // }
  },
  directories: {
    // "/path/to/directory/": { files: ["filePath"] }
  },
});

export const mutations = {
  ADD_FILE(state, media) {
    db.files.add({
      filePath: media.filePath,
      title: media.metadata.common.title,
      artist: media.metadata.common.artist,
      album: media.metadata.common.album,
      bpm: media.metadata.common.bpm || 0,
      duration: media.metadata.format.duration || 0,
    });
  },

  UPDATE_FILE(state, media) {
    state.files[media.filePath] = { ...state.files[media.filePath], ...media };
  },

  REMOVE_FILE(state, { filePath }) {
    db.files.where("filePath").equals(filePath).delete();
  },

  ADD_DIRECTORY(state, directory) {
    state.directories[directory.filePath] = directory;
  },

  UPDATE_DIRECTORY(state, directory) {
    state.directories[directory.filePath] = {
      ...state.directories[directory.filePath],
      ...directory,
    };
  },

  REMOVE_DIRECTORY(state, { filePath }) {
    delete state.directories[filePath];
  },
};

// useful?
export const mutationTypes = Object.keys(mutations).map(
  (key) => `media/${key}`
);
