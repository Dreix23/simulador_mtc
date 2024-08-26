<script setup>
import { ref, watch } from 'vue';
import { CircleMinus, CirclePlus } from "lucide-vue-next";
import { logInfo, logError } from '@/utils/logger.js';

const props = defineProps({
  initialZoom: {
    type: Number,
    default: 45 // Por defecto, el tamaño de fuente es para el 45%
  }
});

const emit = defineEmits(['zoomChange']);

const zoomLevel = ref(props.initialZoom);
const fontSize = ref('16px'); // Tamaño de fuente dinámico basado en zoom

const updateFontSize = () => {
  if (zoomLevel.value >= 45) {
    // De 45% a 100%, ajustamos el tamaño de fuente proporcionalmente hasta 22px
    fontSize.value = `${16 + (zoomLevel.value - 45) / 55 * (22 - 16)}px`;
  } else {
    // De 0% a 45%, ajustamos el tamaño de fuente proporcionalmente hasta 5px
    fontSize.value = `${16 - (45 - zoomLevel.value) / 45 * (16 - 5)}px`;
  }
};

const setZoom = (value) => {
  zoomLevel.value = Math.max(0, Math.min(100, value));
};

const decreaseZoom = () => {
  setZoom(zoomLevel.value - 5);
  logInfo(`Zoom disminuido a ${zoomLevel.value}%`);
};

const increaseZoom = () => {
  setZoom(zoomLevel.value + 5);
  logInfo(`Zoom aumentado a ${zoomLevel.value}%`);
};

watch(zoomLevel, (newValue) => {
  if (newValue < 0 || newValue > 100) {
    logError(`Valor de zoom inválido: ${newValue}%`);
    setZoom(Math.max(0, Math.min(100, newValue)));
  }
  emit('zoomChange', zoomLevel.value);
  updateFontSize();
});

// Inicializar el tamaño de fuente basado en el nivel inicial de zoom
updateFontSize();
</script>

<template>
  <div class="flex items-center">
    <span class="mr-2 text-sm font-medium text-gray-600">{{ zoomLevel }}%</span>
    <CircleMinus @click="decreaseZoom" class="mr-2 cursor-pointer text-gray-600 hover:text-gray-800" :size="20" />
    <div class="relative w-[150px] h-2 bg-gray-200 rounded-full mr-2">
      <div
          class="absolute top-0 left-0 h-full bg-red-500 rounded-full"
          :style="{ width: `${zoomLevel}%` }"
      ></div>
      <input
          type="range"
          id="zoomRange"
          min="0"
          max="100"
          v-model="zoomLevel"
          @input="setZoom($event.target.value)"
          class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
    <CirclePlus @click="increaseZoom" class="cursor-pointer text-gray-600 hover:text-gray-800" :size="20" />
  </div>
</template>

<style scoped></style>
