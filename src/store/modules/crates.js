export const namespaced = true;

export const state = () => ({
  all: {
    1: {
      id: 1,
      name: "Crate 1",
      description: "This is Crate 1",
      files: [],
    },
    // someId: {
    //   id: someId,
    //   name: "My Crate",
    //   media: [
    //
    //   ]
    // }
  },
});

export const actions = {};

export const mutations = {
  ADD(state, crate) {
    state.all[crate.id] = crate;
  },

  REMOVE(state, { id }) {
    delete state.all[id];
  },

  ADD_TO_CRATE(state, { crateId, filePath }) {
    state.all[crateId].files.push(filePath);
  },
};

// useful?
export const mutationTypes = Object.keys(mutations).map(
  (key) => `crates/${key}`
);
