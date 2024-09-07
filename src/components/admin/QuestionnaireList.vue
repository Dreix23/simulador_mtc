<script setup>
import {ref, onMounted, onUnmounted} from "vue";
import {Plus, Edit, Trash2, Loader2} from "lucide-vue-next";
import {logInfo, logError} from "@/utils/logger.js";
import {
  getQuestionnaires,
  uploadExcelToFirestore,
  initializeRealtimeSync,
  deleteQuestionnaire
} from '@/services/questionnaire_service';

const groupedQuestionnaires = ref({});
const emit = defineEmits(["editQuestionnaire"]);
const loading = ref(false);
const uploading = ref(false);
const deleting = ref(false);
const fileInput = ref(null);

let unsubscribe = null;

onMounted(async () => {
  await loadQuestionnaires();
  unsubscribe = initializeRealtimeSync((updatedQuestionnaires) => {
    groupedQuestionnaires.value = updatedQuestionnaires;
    logInfo("Cuestionarios actualizados en tiempo real");
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const loadQuestionnaires = async () => {
  try {
    loading.value = true;
    groupedQuestionnaires.value = await getQuestionnaires();
    logInfo("Cuestionarios obtenidos y agrupados exitosamente");
  } catch (error) {
    logError('Error al cargar los cuestionarios:', error);
  } finally {
    loading.value = false;
  }
};

const editQuestionnaire = (tema) => {
  logInfo(`Editando cuestionario del tema: ${tema}`);
  const questionnairesForTema = groupedQuestionnaires.value[tema] || [];
  emit("editQuestionnaire", questionnairesForTema);
};

const uploadExcel = async () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    uploading.value = true;
    try {
      await uploadExcelToFirestore(file);
      logInfo("Datos subidos exitosamente a Firestore");
    } catch (error) {
      logError('Error al procesar el archivo:', error);
    } finally {
      uploading.value = false;
      event.target.value = "";
    }
  }
};

const confirmDelete = async (tema) => {
  if (confirm(`¿Estás seguro de que quieres eliminar el tema "${tema}" y todos sus cuestionarios?`)) {
    deleting.value = true;
    try {
      await deleteQuestionnaire(tema);
      logInfo(`Tema "${tema}" y sus cuestionarios eliminados exitosamente`);
    } catch (error) {
      logError(`Error al eliminar el tema "${tema}":`, error);
    } finally {
      deleting.value = false;
    }
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Lista de Temas</h2>
      <div class="flex gap-[15px]">
        <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept=".xlsx, .xls"
            class="hidden"
        />
        <button
            @click="uploadExcel"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-color-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="uploading"
        >
          <span v-if="!uploading" class="icon-[tabler--file-type-xls] text-size-20 mr-2"></span>
          <Loader2 v-else class="animate-spin mr-2 h-5 w-5"/>
          {{ uploading ? 'Subiendo...' : 'Subir Excel' }}
        </button>
        <button
            @click="editQuestionnaire(null)"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus class="h-5 w-5 mr-2"/>
          Crear Cuestionario
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-40">
      <Loader2 class="animate-spin h-8 w-8 text-indigo-600"/>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
          v-for="(questionnaires, tema) in groupedQuestionnaires"
          :key="tema"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200"
      >
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900 truncate">
              {{ tema }}
            </h3>
            <div class="flex items-center">
              <button
                  @click="editQuestionnaire(tema)"
                  class="text-indigo-600 hover:text-indigo-800 focus:outline-none mr-2"
              >
                <Edit class="h-5 w-5"/>
              </button>
              <button
                  @click="confirmDelete(tema)"
                  class="text-red-600 hover:text-red-800 focus:outline-none"
                  :disabled="deleting"
              >
                <Trash2 v-if="!deleting" class="h-5 w-5"/>
                <Loader2 v-else class="animate-spin h-5 w-5"/>
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-500">
            {{ questionnaires.length }} cuestionario(s)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.questionnaire-card {
  @apply bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200;
}

.questionnaire-card:hover {
  @apply shadow-lg;
}
</style>
