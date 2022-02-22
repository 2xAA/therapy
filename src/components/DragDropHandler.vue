<script setup>
/* globals ipcRenderer */
import { onMounted } from "vue";
import store from "../store";

ipcRenderer.receive("dropped-file", (files) => {
  console.log(files);
  files.forEach((file) => store.commit("media/ADD_FILE", file));
});

onMounted(() => {
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();

    let pathArr = [];
    for (const f of event.dataTransfer.files) {
      // Using the path attribute to get absolute file path
      console.log("File Path of dragged files: ", f.path);
      pathArr.push(f.path); // assemble array for main.js
    }
    console.log(pathArr);
    ipcRenderer.send("dropped-file", pathArr);
  });
});
</script>

<template>
  <div></div>
</template>
