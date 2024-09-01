<script setup>
import { ref } from 'vue';
import { Loader2, FileDown, FileUp } from 'lucide-vue-next';
import { logError, logInfo } from '@/utils/logger.js';
import { userService } from '@/services/user_service.js';

const props = defineProps({
  isLoading: {
    type: Object,
    default: () => ({ downloadExcel: false, uploadExcel: false }),
  },
});

const emit = defineEmits(['update:isLoading']);

const fileInput = ref(null);

const downloadExcelTemplate = () => {
  const link = document.createElement('a');
  link.href = new URL('@/assets/modelo-mtc.xlsx', import.meta.url).href;
  link.download = 'Postulantes.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const uploadExcel = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleExcelUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    emit('update:isLoading', {...props.isLoading, uploadExcel: true});
    try {
      const addedUsers = await userService.processExcelFile(file);
      logInfo(`${addedUsers.length} usuarios importados desde Excel`);
    } catch (error) {
      logError(`Error al procesar el archivo Excel: ${error.message}`);
    } finally {
      emit('update:isLoading', {...props.isLoading, uploadExcel: false});
      event.target.value = '';
    }
  }
};

const getColorClass = (color) => {
  switch (color) {
    case 'green':
      return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
    case 'blue':
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    default:
      return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
  }
};
</script>

<template>
  <div class="space-x-4">
    <button
        @click="downloadExcelTemplate"
        :disabled="isLoading.downloadExcel"
        :class="[
        'w-50 cursor-pointer inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 h-12',
        getColorClass('green'),
        { 'opacity-50 cursor-not-allowed': isLoading.downloadExcel }
      ]"
    >
      <Loader2 v-if="isLoading.downloadExcel" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/>
      <FileDown v-else class="-ml-1 mr-3 h-5 w-5"/>
      Descargar Plantilla
    </button>
    <button
        @click="uploadExcel"
        :disabled="isLoading.uploadExcel"
        :class="[
        'w-40 cursor-pointer inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 h-12',
        getColorClass('blue'),
        { 'opacity-50 cursor-not-allowed': isLoading.uploadExcel }
      ]"
    >
      <Loader2 v-if="isLoading.uploadExcel" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/>
      <FileUp v-else class="-ml-1 mr-3 h-5 w-5"/>
      Subir Plantilla
    </button>
    <input
        type="file"
        ref="fileInput"
        @change="handleExcelUpload"
        accept=".xlsx,.xls"
        class="hidden"
    />
  </div>
</template>

<style scoped>
</style>
