<script setup>
import { ref, watch, onMounted } from "vue";
import { FileQuestion, Loader2, ArrowLeft, Plus, Trash2, Image, Check } from "lucide-vue-next";
import { logInfo, logError, logDebug } from "@/utils/logger.js";
import { updateQuestionnaire, deleteQuestion, uploadImage } from "@/services/questionnaire_service.js";
import { categories, selectedCategory, mapCategory, reverseCategoryMap, updateAllQuestionsCategory } from "@/utils/category_utils.js";

const props = defineProps({
  editData: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["close", "save"]);

const questionnaire = ref({
  id: null,
  title: "",
  questions: [],
});
const isLoading = ref(false);

const selectedTipoMateria = ref("");
const tiposMateria = ref(["Materias generales", "Materias específicas"]);

const loadQuestionnaire = (data) => {
  isLoading.value = true;
  try {
    logInfo("Cargando cuestionario");
    logDebug("Datos recibidos en loadQuestionnaire:", data);

    const sortedData = [...data].sort((a, b) => a.CATEGORIA.localeCompare(b.CATEGORIA));

    questionnaire.value = {
      id: sortedData[0].id,
      title: sortedData[0].TEMA,
      questions: sortedData.map(questionData => ({
        id: questionData.id,
        text: questionData.DESCRIPCIÓN_DE_LA_PREGUNTA,
        options: [
          questionData.ALTERNATIVA_1,
          questionData.ALTERNATIVA_2,
          questionData.ALTERNATIVA_3,
          questionData.ALTERNATIVA_4
        ],
        correctOption: ['A', 'B', 'C', 'D'].indexOf(questionData.RESPUESTA.toUpperCase()),
        image: null,
        imageUrl: questionData.IMAGE_URL || null,
        imagePreview: questionData.IMAGE_URL || null,
        category: mapCategory(questionData.CATEGORIA),
        tipo_de_materia: questionData.TIPO_DE_MATERIA,
        fundamento: questionData.FUNDAMENTO || "",
      })),
    };

    if (questionnaire.value.questions.length > 0) {
      selectedTipoMateria.value = questionnaire.value.questions[0].tipo_de_materia;
      selectedCategory.value = questionnaire.value.questions[0].category;
    }

    logInfo(`Cuestionario cargado: ${questionnaire.value.title}`);
    logDebug(`Número de preguntas cargadas: ${questionnaire.value.questions.length}`);
  } catch (error) {
    logError(`Error al cargar el cuestionario: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  logInfo("QuestionnaireForm montado");
  logDebug("Datos de edición recibidos:", props.editData);
  if (props.editData.length > 0) {
    loadQuestionnaire(props.editData);
  }
});

watch(() => props.editData, (newData) => {
  logInfo("Datos de edición actualizados");
  logDebug("Nuevos datos de edición:", newData);
  if (newData && newData.length > 0) {
    loadQuestionnaire(newData);
  }
}, { deep: true });

const addQuestion = () => {
  questionnaire.value.questions.push({
    id: `new-${Date.now()}`,
    text: "",
    options: ["", "", "", ""],
    correctOption: 0,
    image: null,
    imageUrl: null,
    imagePreview: null,
    category: selectedCategory.value,
    tipo_de_materia: selectedTipoMateria.value,
    fundamento: "",
  });
};

const removeQuestion = async (index) => {
  const question = questionnaire.value.questions[index];
  if (question.id.startsWith('new-')) {
    questionnaire.value.questions.splice(index, 1);
  } else {
    try {
      await deleteQuestion(question.id);
      questionnaire.value.questions.splice(index, 1);
      logInfo(`Pregunta eliminada: ${question.id}`);
    } catch (error) {
      logError(`Error al eliminar la pregunta: ${error.message}`);
    }
  }
};

const addOption = (questionIndex) => {
  if (questionnaire.value.questions[questionIndex].options.length < 6) {
    questionnaire.value.questions[questionIndex].options.push("");
  } else {
    logInfo("No se pueden agregar más de 6 opciones");
  }
};

const removeOption = (questionIndex, optionIndex) => {
  const question = questionnaire.value.questions[questionIndex];
  if (question.options.length > 2) {
    question.options.splice(optionIndex, 1);
    if (question.correctOption >= question.options.length) {
      question.correctOption = question.options.length - 1;
    }
  } else {
    logInfo("Debe haber al menos 2 opciones");
  }
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
  questionnaire.value.questions[questionIndex].imageUrl = null;
};

const setCorrectOption = (questionIndex, optionIndex) => {
  questionnaire.value.questions[questionIndex].correctOption = optionIndex;
};

const saveQuestionnaire = async () => {
  if (!questionnaire.value.title || questionnaire.value.questions.length === 0) {
    logError("No se puede guardar un cuestionario vacío");
    return;
  }
  isLoading.value = true;
  try {
    logInfo("Guardando cuestionario...");
    logDebug("Datos del cuestionario a guardar:", questionnaire.value);

    const imageUploadPromises = [];
    const questions = questionnaire.value.questions;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.image instanceof File) {
        imageUploadPromises.push(
            uploadImage(question.image).then(imageUrl => {
              question.imageUrl = imageUrl;
            })
        );
      }
      question.category = reverseCategoryMap(question.category);
      if (typeof question.correctOption !== 'number' || question.correctOption < 0 || question.correctOption > 3) {
        logError(`Opción correcta inválida para la pregunta: ${question.text}`);
        question.correctOption = 0;
      }
      question.tipo_de_materia = selectedTipoMateria.value;
    }

    await Promise.all(imageUploadPromises);

    await updateQuestionnaire(questionnaire.value);
    logInfo(`Cuestionario guardado: ${questionnaire.value.title}`);
    emit("save", questionnaire.value);
    emit("close");
  } catch (error) {
    logError(`Error al guardar el cuestionario: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const handleCategoryChange = (newCategory) => {
  selectedCategory.value = newCategory;
  if (questionnaire.value && questionnaire.value.questions) {
    questionnaire.value.questions.forEach(question => {
      question.category = newCategory;
    });
  }
};

watch(selectedCategory, (newCategory) => {
  updateAllQuestionsCategory(questionnaire.value, newCategory);
});

// Actualizar tipo_de_materia en todas las preguntas
watch(selectedTipoMateria, (newTipoMateria) => {
  if (questionnaire.value && questionnaire.value.questions) {
    questionnaire.value.questions.forEach(question => {
      question.tipo_de_materia = newTipoMateria;
    });
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 w-full">
    <div class="flex justify-between items-center mb-6">
      <div class="flex">
        <button @click="emit('close')" class="mr-4">
          <ArrowLeft class="h-6 w-6 text-gray-600" />
        </button>
        <h2 class="text-3xl font-bold text-gray-800 flex-grow text-center">
          {{ questionnaire.id ? "Editar" : "Crear" }} Cuestionario
        </h2>
      </div>
      <div class="flex gap-[20px]">
        <div class="flex flex-col gap-[2px]">
          <select
              v-model="selectedTipoMateria"
              class="select-form text-sm bg-transparent border-none focus:ring-0 z-10 cursor-pointer"
          >
            <option value="" disabled>Tipo de Materia</option>
            <option v-for="tipo in tiposMateria" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>
        </div>

        <div>
          <select
              id="categories"
              :value="selectedCategory"
              @change="handleCategoryChange($event.target.value)"
              class="select-form text-sm bg-transparent border-none focus:ring-0 z-10 cursor-pointer"
          >
            <option value="" disabled>Categorias</option>
            <option
                v-for="category in categories"
                :key="category"
                :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <label
          for="questionnaireTitle"
          class="block text-lg font-medium text-gray-700 mb-2"
      >Título del Cuestionario</label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
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
      <div
          v-for="(question, qIndex) in questionnaire.questions"
          :key="qIndex"
          :class="[
          'mb-6 p-4 border border-gray-200 rounded-md',
          qIndex % 2 === 0 ? 'bg-purple-50' : 'bg-blue-50',
        ]"
      >
        <div class="flex items-center mb-4">
          <input
              v-model="question.text"
              class="flex-grow p-3 text-lg border border-gray-300 rounded-md mr-2"
              placeholder="Texto de la pregunta"
          />
          <label class="flex-shrink-0">
            <input
                type="file"
                @change="(e) => handleImageUpload(e, qIndex)"
                accept="image/*"
                class="hidden"
                :ref="`fileInput${qIndex}`"
            />
            <button
                @click="$refs[`fileInput${qIndex}`][0].click()"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <Image class="h-5 w-5 mr-2" />
              Imagen
            </button>
          </label>
        </div>
        <div v-if="question.imagePreview" class="mb-4">
          <img
              :src="question.imagePreview"
              alt="Vista previa"
              class="max-w-xs h-auto"
          />
          <button
              @click="removeImage(qIndex)"
              class="mt-2 text-red-600 hover:text-red-800"
          >
            Eliminar imagen
          </button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
              v-for="(option, oIndex) in question.options"
              :key="oIndex"
              class="flex items-center"
          >
            <input
                v-model="question.options[oIndex]"
                class="flex-grow p-2 border border-gray-300 rounded-md"
                :placeholder="`Opción ${oIndex + 1}`"
            />
            <button
                @click="setCorrectOption(qIndex, oIndex)"
                :class="[
                'ml-2 p-1 rounded-full',
                question.correctOption === oIndex
                  ? 'bg-green-500'
                  : 'bg-gray-200',
              ]"
            >
              <Check class="h-5 w-5 text-white" />
            </button>
            <button
                @click="removeOption(qIndex, oIndex)"
                class="ml-2 text-red-600 hover:text-red-800"
            >
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="mt-4 flex justify-between">
          <button
              @click="addOption(qIndex)"
              class="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <Plus class="h-5 w-5 mr-1" />
            Añadir opción
          </button>
          <div class="flex flex-[0.6] gap-[10px] items-center">
            <label for="#">Fundamento</label>
            <input
                type="text"
                v-model="question.fundamento"
                class="flex-grow p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
              @click="removeQuestion(qIndex)"
              class="text-red-600 hover:text-red-800 flex items-center"
          >
            <Trash2 class="h-5 w-5 mr-1" />
            Eliminar pregunta
          </button>
        </div>
      </div>
      <button
          @click="addQuestion"
          class="text-indigo-600 hover:text-indigo-800 flex items-center"
      >
        <Plus class="h-5 w-5 mr-1" />
        Añadir pregunta
      </button>
    </div>

    <button
        @click="saveQuestionnaire"
        :disabled="isLoading || !questionnaire.title"
        class="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Loader2
          v-if="isLoading"
          class="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
      />
      {{
        isLoading
            ? "Guardando..."
            : (questionnaire.id ? "Actualizar" : "Crear") + " Cuestionario"
      }}
    </button>
  </div>
</template>

<style scoped>
.select-form {
  min-width: 200px;
  height: 41px;
  cursor: pointer;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  padding: 2px 5px 2px 5px;
}
</style>
