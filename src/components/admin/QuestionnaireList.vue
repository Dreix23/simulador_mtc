<script setup>
import { ref } from "vue";
import { FileQuestion, Plus, Edit } from "lucide-vue-next";
import { logInfo } from "@/utils/logger.js";

const questionnaires = ref([
  { id: 1, title: "Cuestionario de Satisfacción del Cliente" },
  { id: 2, title: "Evaluación de Desempeño Anual" },
  { id: 3, title: "Encuesta de Clima Laboral" },
]);

const emit = defineEmits(["editQuestionnaire"]);

const editQuestionnaire = (id) => {
  logInfo(`Editando cuestionario con ID: ${id}`);
  emit("editQuestionnaire", id);
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Lista de Cuestionarios</h2>
      <div class="flex gap-[15px]">
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-color-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="icon-[tabler--file-type-xls] text-size-20 mr-2"></span>
          Subir Excel
        </button>
        <button
          @click="editQuestionnaire(null)"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus class="h-5 w-5 mr-2" />
          Crear Cuestionario
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="questionnaire in questionnaires"
        :key="questionnaire.id"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
      >
        <div class="px-4 py-5 sm:p-6 flex items-center justify-between">
          <div class="flex items-center">
            <FileQuestion class="h-6 w-6 text-indigo-500 mr-3" />
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ questionnaire.title }}
            </h3>
          </div>
          <button
            @click="editQuestionnaire(questionnaire.id)"
            class="text-indigo-600 hover:text-indigo-800"
          >
            <Edit class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
