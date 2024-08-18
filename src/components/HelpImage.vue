<script setup>
import { XCircle } from 'lucide-vue-next';

defineProps({
  showHelpImage: Boolean,
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div v-if="showHelpImage" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
      <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <XCircle class="w-6 h-6" />
      </button>
      <img src="@/assets/images/teclado-ayuda.png" alt="Ayuda para el uso del teclado" class="max-w-full h-auto mx-auto" />
    </div>
  </div>
</template>

<style scoped>
/* Añadir estilos si es necesario */
</style>