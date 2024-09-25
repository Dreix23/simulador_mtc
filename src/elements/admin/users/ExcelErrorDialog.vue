<script setup>
import { ref } from 'vue';
import { AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  errorSummary: Object,
});

const emit = defineEmits(['close']);

const closeDialog = () => {
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0  bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out">
      <div class="flex flex-col items-center text-center mb-4">
        <AlertCircle class="text-red-500 w-24 h-24 mb-4" />
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Errores en el archivo Excel</h2>
      </div>
      <div class="text-left mb-6">
        <p class="text-gray-700 mb-2">Se encontraron errores en el archivo Excel:</p>
        <ul class="list-disc list-inside text-red-600">
          <li v-if="errorSummary.details.categoria">
            Errores en categorías: {{ errorSummary.details.categoria }}
          </li>
          <li v-if="errorSummary.details.tipoDocumento">
            Errores en tipos de documento: {{ errorSummary.details.tipoDocumento }}
          </li>
          <li v-if="errorSummary.details.otros">
            Otros errores: {{ errorSummary.details.otros }}
          </li>
        </ul>
      </div>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p class="text-yellow-700">
          Se recomienda descargar y utilizar la plantilla de ejemplo para evitar errores.
        </p>
      </div>
      <div class="text-center">
        <button @click="closeDialog" class="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>