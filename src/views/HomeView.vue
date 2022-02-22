<template>
  <div class="home">
    <DragDropHandler />
    <WaveSurfer :url="url" />

    <input type="text" v-model="searchTerm" ref="searchInput" />
    <FileTable
      :files="files"
      :currentTrack="currentTrack"
      :search-term="searchTerm"
      @play="play"
    />

    <div class="crates">
      <div
        class="crate"
        v-for="(crate, index) in $store.state.crates.all"
        :key="`crate-${index}`"
        @drop="onCrateDrop($event, 1)"
        @dragover.prevent
        @dragenter.prevent
        @contextmenu="crateContextMenu($event, index)"
      >
        {{ crate.name }} ({{ crate.files.length }})
      </div>
    </div>
  </div>
</template>

<script>
/* globals ipcRenderer */

import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";

import { db } from "../db.js";
import DragDropHandler from "../components/DragDropHandler.vue";
import WaveSurfer from "../components/Wavesurfer.vue";
import FileTable from "../components/FileTable.vue";

export default {
  name: "HomeView",
  components: {
    DragDropHandler,
    WaveSurfer,
    FileTable,
  },

  data() {
    return {
      db,
      files: useObservable(liveQuery(() => db.files.toArray())),
      currentTrack: "",
      searchTerm: "",
    };
  },

  mounted() {
    this.$refs.searchInput.focus();

    ipcRenderer.receive("play-track", (filePath) => {
      this.play(filePath);
    });

    ipcRenderer.receive("remove-track", (filePath) => {
      this.$store.commit("media/REMOVE_FILE", { filePath });
    });

    ipcRenderer.receive("export-crate", ({ crateId, type }) => {
      // create m3u playlist from files in crate
      const crate = this.$store.state.crates.all[crateId];
      const files = crate.files.map((filePath) =>
        this.files.find((file) => file.filePath === filePath)
      );

      if (type === "playlist") {
        let m3u = "#EXTM3U\n";
        m3u += `#PLAYLIST:${crate.name}\n`;

        m3u += files
          .map(
            (file) =>
              `#EXTINF:${file.duration || 0},${file.artist} - ${file.title}\n${
                file.filePath
              }`
          )
          .join("\n");

        // save to file
        const fileName = `${crate.name}.m3u`;
        ipcRenderer.send("save-file", { fileName, content: m3u });
      }
    });
  },

  computed: {
    url() {
      return this.currentTrack ? `therapy://${this.currentTrack}` : null;
    },
  },

  methods: {
    play(file) {
      this.currentTrack = file;
    },

    onCrateDrop(evt, crateId) {
      const filePath = evt.dataTransfer.getData("filePath");
      const item = this.files.find((item) => item.filePath === filePath);

      if (item) {
        this.$store.commit("crates/ADD_TO_CRATE", {
          filePath,
          crateId,
        });
      }
    },

    crateContextMenu(e, crateId) {
      ipcRenderer.send("context-menu", {
        type: "crate",
        x: e.clientX,
        y: e.clientY,
        payload: { crateId },
      });
    },
  },
};
</script>

<style scoped>
.home {
  height: calc(100% - 120px);
  display: flex;
  flex-direction: column;
}

.crates {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 120px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;

  /* background-color: rgba(255, 255, 255, 0.1); */
  /* backdrop-filter: blur(10px); */
}

.crate {
  width: 100px;
  height: 100px;
  border-radius: 18px;
  border: 1px solid #111;
  background-color: #fff;

  display: grid;
  place-content: center;
}
</style>
