export const namespaced = true;

export const state = () => ({
  all: {
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
  ADD({ state }, crate) {
    state.all[crate.id] = crate;
  },

  REMOVE({ state }, { id }) {
    delete state.all[id];
  },
};

// useful?
export const mutationTypes = Object.keys(mutations).map(
  (key) => `crates/${key}`
);
