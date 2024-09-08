<script setup>
import { ref } from 'vue';
import { AlertTriangle } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  title: String,
  message: String,
});

const emit = defineEmits(['confirm', 'cancel']);

const confirmDialog = () => {
  emit('confirm');
};

const cancelDialog = () => {
  emit('cancel');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out">
      <div class="flex flex-col items-center text-center">
        <AlertTriangle class="text-red-500 w-16 h-16 mb-4" />
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ title }}</h2>
        <p class="text-gray-600 mb-6 whitespace-pre-line">{{ message }}</p>
      </div>
      <div class="flex justify-center space-x-4">
        <button @click="cancelDialog" class="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400">
          Cancelar
        </button>
        <button @click="confirmDialog" class="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
