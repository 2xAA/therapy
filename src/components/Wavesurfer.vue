<script setup>
import { onMounted, defineProps, watch, ref, onBeforeUnmount } from "vue";
import WaveSurfer from "wavesurfer.js";

const wavesurferRef = ref(null);

const props = defineProps({
  url: {
    type: String,
    default: "",
  },
});

let wavesurfer;

onMounted(() => {
  wavesurfer = WaveSurfer.create({
    container: wavesurferRef.value,
    waveColor: "violet",
    progressColor: "purple",
    xhr: {
      mode: "no-cors",
    },
  });

  wavesurfer.zoom(100);

  wavesurfer.on("ready", () => wavesurfer.play());
});

onBeforeUnmount(() => {
  wavesurfer.destroy();
});

watch(
  () => props.url,
  () => {
    if (props.url) {
      wavesurfer.load(props.url);
    }
  }
);
</script>

<template>
  <div ref="wavesurferRef"></div>
</template>
