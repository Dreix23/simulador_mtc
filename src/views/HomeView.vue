<script setup>
import {ref, computed, onMounted, onUnmounted} from "vue";
import {ChevronRight, ChevronLeft} from "lucide-vue-next";
import {useRouter} from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import HelpImage from "@/components/HelpImage.vue";
import SideBar from "@/components/home/SideBar.vue";
import ZoomControl from "@/components/home/ZoomControl.vue";
import ConfirmationDialog from "@/components/home/ConfirmationDialog.vue";
import {logInfo, logError} from '@/utils/logger.js';

const isResizing = ref(false);
const leftPaneWidth = ref("320px");
const maxWidth = ref("80%");
const showHelpImage = ref(false);
const router = useRouter();

const answeredQuestions = ref(0);
const totalQuestions = ref(4);

const currentQuestion = ref(1);
const questions = ref([
  {
    id: 1,
    text: "¿Se puede conducir un vehículo con el motor en punto neutro?",
    options: [
      "A. Algunas veces",
      "B. No se encuentra regulado en el reglamento",
      "C. Sí, está permitido",
      "D. No, está prohibido",
    ],
  },
  {
    id: 2,
    text: "¿Qué indica la siguiente señal de tránsito?",
    imageUrl: "https://via.placeholder.com/150",
    options: [
      "A. Prohibido el paso de vehículos",
      "B. Zona de estacionamiento",
      "C. Contramano o sentido contrario",
      "D. Velocidad máxima permitida",
    ],
  },
]);

const selectedAnswers = ref({});
const remainingTime = ref("00:00");
const showConfirmationDialog = ref(false);

const startResizing = (e) => {
  isResizing.value = true;
};

const stopResizing = () => {
  isResizing.value = false;
};

const resize = (e) => {
  if (isResizing.value) {
    const containerWidth = window.innerWidth;
    let newWidth = e.clientX;
    const maxWidthInPixels = containerWidth * 0.8;

    if (newWidth < 300) {
      newWidth = 300;
    } else if (newWidth > maxWidthInPixels) {
      newWidth = maxWidthInPixels;
    }

    leftPaneWidth.value = `${newWidth}px`;
  }
};

onMounted(() => {
  window.addEventListener("mousemove", resize);
  window.addEventListener("mouseup", stopResizing);
  maxWidth.value = `${window.innerWidth * 0.8}px`;
});

onUnmounted(() => {
  window.removeEventListener("mousemove", resize);
  window.removeEventListener("mouseup", stopResizing);
});

const markAsAnswered = () => {
  answeredQuestions.value += 1;
};

const selectAnswer = (questionId, option) => {
  selectedAnswers.value[questionId] = option;
  markAsAnswered();
};

const previousQuestion = () => {
  if (currentQuestion.value > 1) {
    currentQuestion.value -= 1;
  }
};

const nextQuestion = () => {
  if (currentQuestion.value < totalQuestions.value) {
    currentQuestion.value += 1;
  }
};

const toggleHelpImage = () => {
  showHelpImage.value = !showHelpImage.value;
};

const openConfirmationDialog = () => {
  showConfirmationDialog.value = true;
};

const finishExam = () => {
  logInfo("Examen finalizado");
  router.push({name: "ExamFinished"});
};

const zoomLevel = ref(100);

const baseFontSize = computed(() => {
  const calculatedSize = (zoomLevel.value / 100) * 16;
  return `${Math.min(calculatedSize, 20.8)}px`;
});

const handleZoomChange = (newZoom) => {
  zoomLevel.value = newZoom;
  const container = document.querySelector(".container-question");
  container.style.fontSize = baseFontSize.value;
};

onMounted(() => {
  handleZoomChange(zoomLevel.value);
});
</script>

<template>
  <Header
      title="Examen de Conocimientos - CATEGORÍA: (A) I"
      :showMenuIcon="true"
  />

  <main class="flex h-[calc(100vh-115px)] select-none">
    <SideBar
        :leftPaneWidth="leftPaneWidth"
        :maxWidth="maxWidth"
        :answeredQuestions="answeredQuestions"
        :totalQuestions="totalQuestions"
    />

    <div class="w-1 cursor-ew-resize bg-gray-300 hover:bg-gray-400 transition-colors duration-300"
         @mousedown="startResizing"></div>
    <section class="flex-grow bg-transparent shadow-md overflow-auto flex flex-col relative">
      <div class="flex-grow p-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-2">
          <div></div>
          <p
              class="text-red-500"
          >
            Tiempo restante:
            <span class="font-semibold">{{ remainingTime }}</span>
          </p>
          <p>
            Intentos: 1 de 0
          </p>
        </div>

        <div class="bg-gray-200 h-2.5 mb-4">
          <div class="bg-red-600 h-full w-1/2"></div>
        </div>
        <div class="bg-white px-5 pb-7 rounded shadow-md container-question">
          <div class="w-full h-[53px] flex items-center border-b-2">
            <h3
                class="font-semibold"
                :style="{ fontSize: baseFontSize }"
            >
              Tema: Obligaciones del conductor en materia de tránsito terrestre
            </h3>
          </div>

          <div
              v-for="question in questions"
              :key="question.id"
              v-show="question.id === currentQuestion"
              class="pb-11 pt-7"
          >
            <p class="mb-10 text-lg" :style="{ fontSize: baseFontSize }">
              {{ question.id }}. {{ question.text }}
            </p>
            <div v-if="question.imageUrl" class="flex justify-center mb-6">
              <img
                  :src="question.imageUrl"
                  alt="Imagen de referencia"
                  class="max-w-full h-auto"
              />
            </div>
            <div class="pl-6 flex flex-col gap-8">
              <div
                  v-for="option in question.options"
                  :key="option"
                  class="mb-4"
              >
                <label
                    class="flex items-center"
                    :style="{ fontSize: baseFontSize }"
                >
                  <input
                      type="radio"
                      :name="`question${question.id}`"
                      :value="option"
                      :checked="selectedAnswers[question.id] === option"
                      @change="selectAnswer(question.id, option)"
                      class="mr-2"
                  />
                  {{ option }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center space-x-4">
            <button
                @click="previousQuestion"
                class="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white"
            >
              <ChevronLeft/>
            </button>
            <span>{{ currentQuestion }}/{{ totalQuestions }}</span>
            <button
                @click="nextQuestion"
                class="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white"
            >
              <ChevronRight/>
            </button>
          </div>
          <button
              @click="toggleHelpImage"
              class="bg-red-600 text-white px-4 py-2 rounded text-sm shadow-shadow-btn hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            AYUDA PARA EL USO DEL TECLADO
          </button>
        </div>
      </div>
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center w-full">
        <button
            v-if="currentQuestion === totalQuestions"
            @click="openConfirmationDialog"
            class="flex items-center justify-center gap-[5px] w-[190px] shadow-shadow-btn text-[14px] bg-red-700 text-white py-[7px] rounded-[4px] hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <span class="icon-[lucide--door-closed] text-[15px]"></span>
          FINALIZAR EXAMEN
        </button>
        <ZoomControl :initialZoom="zoomLevel" @zoomChange="handleZoomChange" class="absolute right-4 bottom-0"/>
      </div>
    </section>
  </main>

  <Footer/>
  <HelpImage :showHelpImage="showHelpImage" @close="toggleHelpImage"/>
  <ConfirmationDialog
      v-model:isVisible="showConfirmationDialog"
      @confirmed="finishExam"
  />
</template>

<style scoped>
::-webkit-scrollbar {
  @apply w-2.5;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded-full;
}
</style>
