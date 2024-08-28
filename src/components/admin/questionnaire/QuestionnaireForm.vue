<script setup>
import { ref, onMounted, watch } from 'vue';
import { FileQuestion, Loader2, ArrowLeft, Plus, Trash2, Image } from 'lucide-vue-next';
import { logInfo, logError } from '@/utils/logger.js';

const props = defineProps({
  questionnaireId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close']);

const questionnaire = ref({
  id: null,
  title: '',
  questions: []
});
const isLoading = ref(false);

onMounted(() => {
  if (props.questionnaireId) {
    loadQuestionnaire(props.questionnaireId);
  }
});

watch(() => props.questionnaireId, (newId) => {
  if (newId) {
    loadQuestionnaire(newId);
  } else {
    resetForm();
  }
});

const loadQuestionnaire = async (id) => {
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    questionnaire.value = {
      id: id,
      title: `Cuestionario ${id}`,
      questions: [
        {
          text: '¿Pregunta de ejemplo?',
          options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
          image: null,
          imagePreview: null
        }
      ]
    };
    logInfo(`Cuestionario cargado: ${questionnaire.value.title}`);
  } catch (error) {
    logError(`Error al cargar el cuestionario: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  questionnaire.value = {
    id: null,
    title: '',
    questions: []
  };
};

const saveQuestionnaire = async () => {
  if (!questionnaire.value.title) return;
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    logInfo(`Cuestionario ${questionnaire.value.id ? 'actualizado' : 'añadido'}: ${questionnaire.value.title}`);
    emit('close');
  } catch (error) {
    logError(`Error al ${questionnaire.value.id ? 'actualizar' : 'añadir'} cuestionario: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const addQuestion = () => {
  questionnaire.value.questions.push({
    text: '',
    options: ['', '', '', ''],
    image: null,
    imagePreview: null
  });
};

const removeQuestion = (index) => {
  questionnaire.value.questions.splice(index, 1);
};

const addOption = (questionIndex) => {
  questionnaire.value.questions[questionIndex].options.push('');
};

const removeOption = (questionIndex, optionIndex) => {
  questionnaire.value.questions[questionIndex].options.splice(optionIndex, 1);
};

const handleImageUpload = (event, questionIndex) => {
  const file = event.target.files[0];
  if (file) {
    questionnaire.value.questions[questionIndex].image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      questionnaire.value.questions[questionIndex].imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = (questionIndex) => {
  questionnaire.value.questions[questionIndex].image = null;
  questionnaire.value.questions[questionIndex].imagePreview = null;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 w-full">
    <div class="flex flex-col items-center mb-6">
      <div class="flex items-center w-full">
        <button @click="emit('close')" class="mr-4">
          <ArrowLeft class="h-6 w-6 text-gray-600" />
        </button>
        <h2 class="text-3xl font-bold text-gray-800 flex-grow text-center">
          {{ questionnaire.id ? 'Editar' : 'Crear' }} Cuestionario
        </h2>
      </div>
    </div>
    <div class="mb-6">
      <label for="questionnaireTitle" class="block text-lg font-medium text-gray-700 mb-2">Título del Cuestionario</label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FileQuestion class="h-6 w-6 text-gray-400" />
        </div>
        <input
            type="text"
            id="questionnaireTitle"
            v-model="questionnaire.title"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-4 py-3 sm:text-lg border-gray-300 rounded-md font-bold text-indigo-700"
            placeholder="Ingrese el título del cuestionario"
        />
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-xl font-medium text-gray-900 mb-4">Preguntas</h3>
      <div v-for="(question, qIndex) in questionnaire.questions" :key="qIndex" class="mb-6 p-4 border border-gray-200 rounded-md">
        <div class="flex items-center mb-4">
          <input
              v-model="question.text"
              class="flex-grow p-3 text-lg border border-gray-300 rounded-md mr-2"
              placeholder="Texto de la pregunta"
          />
          <label class="flex-shrink-0">
            <input type="file" @change="(e) => handleImageUpload(e, qIndex)" accept="image/*" class="hidden" ref="fileInput" />
            <button @click="$refs.fileInput[qIndex].click()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
              <Image class="h-5 w-5 mr-2" />
              Imagen
            </button>
          </label>
        </div>
        <div v-if="question.imagePreview" class="mb-4">
          <img :src="question.imagePreview" alt="Vista previa" class="max-w-xs h-auto" />
          <button @click="removeImage(qIndex)" class="mt-2 text-red-600 hover:text-red-800">
            Eliminar imagen
          </button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(option, oIndex) in question.options" :key="oIndex" class="flex items-center">
            <input
                v-model="question.options[oIndex]"
                class="flex-grow p-2 border border-gray-300 rounded-md"
                :placeholder="`Opción ${oIndex + 1}`"
            />
            <button @click="removeOption(qIndex, oIndex)" class="ml-2 text-red-600 hover:text-red-800">
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="mt-4 flex justify-between">
          <button @click="addOption(qIndex)" class="text-indigo-600 hover:text-indigo-800 flex items-center">
            <Plus class="h-5 w-5 mr-1" />
            Añadir opción
          </button>
          <button @click="removeQuestion(qIndex)" class="text-red-600 hover:text-red-800 flex items-center">
            <Trash2 class="h-5 w-5 mr-1" />
            Eliminar pregunta
          </button>
        </div>
      </div>
      <button @click="addQuestion" class="text-indigo-600 hover:text-indigo-800 flex items-center">
        <Plus class="h-5 w-5 mr-1" />
        Añadir pregunta
      </button>
    </div>

    <button
        @click="saveQuestionnaire"
        :disabled="isLoading || !questionnaire.title"
        class="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Loader2 v-if="isLoading" class="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
      {{ isLoading ? 'Guardando...' : (questionnaire.id ? 'Actualizar' : 'Crear') + ' Cuestionario' }}
    </button>
  </div>
</template>

<style scoped>
</style>
