<script setup>
import { ref } from 'vue';
import { Loader2, FileDown, FileUp } from 'lucide-vue-next';
import { logError, logInfo } from '@/utils/logger.js';
import { userService } from '@/services/user_service.js';
import ExcelErrorDialog from './ExcelErrorDialog.vue';

const props = defineProps({
  isLoading: {
    type: Object,
    default: () => ({ downloadExcel: false, uploadExcel: false }),
  },
});

const emit = defineEmits(['update:isLoading', 'usersAdded']);

const fileInput = ref(null);
const showErrorDialog = ref(false);
const errorSummary = ref({ message: '', details: {} });

const downloadExcelTemplate = () => {
  const link = document.createElement('a');
  link.href = new URL('@/assets/plantilla.xlsx', import.meta.url).href;
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
      emit('usersAdded', addedUsers);
    } catch (error) {
      logError(`Error al procesar el archivo Excel: ${error.message}`);
      const errors = error.message.split('\n');
      const errorTypes = {
        categoria: 0,
        tipoDocumento: 0,
        otros: 0
      };
      errors.forEach(err => {
        if (err.includes('Categoría')) errorTypes.categoria++;
        else if (err.includes('Tipo de documento')) errorTypes.tipoDocumento++;
        else errorTypes.otros++;
      });
      errorSummary.value = {
        message: 'Se encontraron errores en el archivo Excel.',
        details: errorTypes
      };
      showErrorDialog.value = true;
    } finally {
      emit('update:isLoading', {...props.isLoading, uploadExcel: false});
      event.target.value = '';
    }
  }
};

const closeErrorDialog = () => {
  showErrorDialog.value = false;
  errorSummary.value = { message: '', details: {} };
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
   <div class="flex gap-4">
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
   </div>
    <input
        type="file"
        ref="fileInput"
        @change="handleExcelUpload"
        accept=".xlsx,.xls"
        class="hidden"
    />
    <ExcelErrorDialog
        :is-open="showErrorDialog"
        :error-summary="errorSummary"
        @close="closeErrorDialog"
    />
</template>

<style scoped>
</style>
