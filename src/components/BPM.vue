<template>
  <span
    v-if="showBpm(bpm)"
    :style="{ backgroundColor: bpmColor(bpm), color: '#fff' }"
    >{{ bpm }}</span
  >
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  bpm: {
    type: Number,
    default: 0,
  },
});

const showBpm = (bpm) => bpm > 20.0 && bpm < 400.0;
const bpmColor = (bpm) => {
  let f = Math.log2(bpm);
  f -= Math.floor(f);
  const h = f * 360.0; /* degrees */

  return `hsl(${h}, 100%, 30%)`;
};
</script>
