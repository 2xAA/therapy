export const namespaced = true;

export const state = () => ({
  files: {
    // "file/path/to/thing.mp3": {
    //   filePath: "file/path/to/thing.mp3",
    //   type: "mp3",
    //   duration: 1000,
    //   bpm: 128.2,
    //   title: "Chemical",
    //   artists: ["2xAA"],
    //   album: "Flow"
    //   cover: "base64 image?",
    // }
  },
});

export const mutations = {
  ADD({ state }, media) {
    state.files[media.filePath] = media;
  },

  REMOVE({ state }, { filePath }) {
    delete state.files[filePath];
  },
};

// useful?
export const mutationTypes = Object.keys(mutations).map(
  (key) => `media/${key}`
);
