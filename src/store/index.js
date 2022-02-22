import { createStore } from "vuex";
import * as crates from "./modules/crates.js";
import * as media from "./modules/media.js";

export default createStore({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    crates,
    media,
  },
});
