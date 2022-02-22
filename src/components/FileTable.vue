<template>
  <div id="drag-clone-hider" aria-hidden></div>

  <DynamicScroller
    :items="sortedFiles"
    :min-item-size="24"
    key-field="filePath"
    class="scroller"
  >
    <template v-slot:before>
      <div class="tr">
        <div
          :key="header"
          class="th"
          :class="[(header || '').toLowerCase()]"
          v-for="header in headers"
        >
          {{ header }}
        </div>
      </div>
    </template>

    <template v-slot="{ item, item: file, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :data-index="index">
        <div
          class="track tr"
          @dblclick="play(file.filePath)"
          @contextmenu="trackContextMenu($event, file.filePath)"
          @dragstart="startTrackDrag($event, file)"
          draggable="true"
          :class="{
            nowPlaying: this.currentTrack === file.filePath,
            startSelect: index === startIndex,
            endSelect: index === endIndex,
            selected:
              (index >= startIndex && index <= endIndex) ||
              firstIndex === index,
          }"
          @mouseup.exact="setFirstIndex(index)"
          @mouseup.shift="setSecondIndex(index)"
        >
          <div class="td"><BPM :bpm="file.bpm" /></div>
          <div class="td">
            {{ new Date(file.duration * 1000).toISOString().substr(14, 5) }}
          </div>
          <div class="td artist">{{ file.artist }}</div>
          <div class="td title">{{ file.title || file.filePath }}</div>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>

  <!-- <table>
    <tbody>
      <tr>
        <th @click="setSort('bpm')">BPM ({{ bpmSortDirection }})</th>
        <th @click="setSort('artist')">Artist ({{ artistSortDirection }})</th>
        <th @click="setSort('title')">Title ({{ titleSortDirection }})</th>
      </tr>
      <tr v-for="(file, index) in sortedFiles" :key="index"></tr>
    </tbody>
  </table> -->
</template>

<script>
/* globals ipcRenderer */
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import BPM from "../components/BPM.vue";

export default {
  emits: ["play"],

  props: {
    files: {
      type: Array,
      required: true,
    },

    currentTrack: {
      type: String,
      required: true,
    },

    searchTerm: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      headers: ["BPM", "Duration", "Artist", "Title"],
      sort: "bpm",
      bpmSortDirection: "dec",
      artistSortDirection: "dec",
      titleSortDirection: "dec",
      startIndex: 0,
      endIndex: -1,
      firstIndex: -1,
    };
  },

  components: {
    BPM,
    DynamicScroller,
    DynamicScrollerItem,
  },

  computed: {
    sortedFiles() {
      const files = this.files || [];
      const sort = this.sort;
      const direction = this[`${sort}SortDirection`];

      return files
        .filter(
          (file) =>
            file?.artist
              ?.toLowerCase()
              .includes(this.searchTerm.toLowerCase()) ||
            file?.title?.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (direction === "dec") {
            [b, a] = [a, b];
          }

          if (sort === "bpm") {
            return (a.bpm || 0) - (b.bpm || 0);
          } else if (sort === "artist") {
            return (a.artist || "").localeCompare(b.artist || "");
          } else {
            return (a.title || "").localeCompare(b.title || "");
          }
        });
    },
  },

  methods: {
    play(filePath) {
      this.$emit("play", filePath);
    },

    setSort(sort) {
      if (this.sort === sort) {
        this[`${sort}SortDirection`] =
          this[`${sort}SortDirection`] === "dec" ? "asc" : "dec";
        return;
      }

      this.sort = sort;
    },

    trackContextMenu(e, filePath) {
      ipcRenderer.send("context-menu", {
        type: "track",
        x: e.clientX,
        y: e.clientY,
        payload: { filePath },
      });
    },

    startTrackDrag(evt, item) {
      const crt = document.createElement("div");
      crt.textContent = item.artist + " - " + item.title;
      crt.className = "track-drag-item";
      crt.style.position = "absolute";
      crt.style.top = "0";
      crt.style.left = "0";
      crt.style.zIndex = "-1";
      document.getElementById("drag-clone-hider").appendChild(crt);
      evt.dataTransfer.setDragImage(crt, 0, 0);

      setTimeout(() => crt.remove(), 20 * 1000);

      evt.dataTransfer.dropEffect = "move";
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("filePath", item.filePath);
    },

    setFirstIndex(i) {
      this.firstIndex = i;
      this.endIndex = -1;
    },

    setSecondIndex(i) {
      if (this.firstIndex < 0) {
        return;
      }

      if (this.firstIndex === i) {
        return;
      }

      if (i > this.firstIndex) {
        this.startIndex = this.firstIndex;
        this.endIndex = i;
      } else {
        this.startIndex = i;
        this.endIndex = this.firstIndex;
      }
    },
  },
};
</script>

<style>
.scroller .vue-recycle-scroller__slot:first-of-type {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
</style>

<style scoped>
.scroller {
  height: 100%;
}

.tr {
  display: flex;
  width: 100%;
}

.th,
.td {
  flex: 1;
}

.td.artist,
.th.artist {
  flex: 2;
}

.td.title,
.th.title {
  flex: 5;
}

.track.nowPlaying {
  background-color: rgb(255, 109, 255);
}

.tr.selected {
  background-color: #ff00ff;
}

.track:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.track td {
  background: none;
}

.track-drag-item {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid #111;
  background-color: #fff;
}

#drag-clone-hider {
  position: relative;
  overflow: hidden;
}
</style>
