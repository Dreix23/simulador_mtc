<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { ChevronRight, ChevronLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import HelpImage from "@/components/HelpImage.vue";
import SideBar from "@/components/home/SideBar.vue";
import ZoomControl from "@/components/home/ZoomControl.vue";
import ConfirmationDialog from "@/components/home/ConfirmationDialog.vue";
import { logInfo, logError, logDebug } from "@/utils/logger.js";
import {
  getQuestionsByCategory,
  unsubscribeFromQuestions,
  getDecryptedResponse,
} from "@/services/questions_service.js";
import { saveExamResults } from "@/services/results_service.js";

const router = useRouter();
const isResizing = ref(false);
const leftPaneWidth = ref("320px");
const maxWidth = ref("80%");
const showHelpImage = ref(false);
const questions = ref([]);
const answeredQuestions = ref(0);
const totalQuestions = ref(0);
const currentQuestion = ref(null);
const selectedAnswers = ref({});
const remainingTime = ref(2400);
const showConfirmationDialog = ref(false);
const zoomLevel = ref(50);

let timer;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
};

const startTimer = () => {
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
      localStorage.setItem("remainingTime", remainingTime.value.toString());
    } else {
      clearInterval(timer);
      finishExam();
    }
  }, 1000);
};

onMounted(async () => {
  try {
    const savedQuestions = localStorage.getItem("examQuestions");
    if (savedQuestions) {
      questions.value = JSON.parse(savedQuestions);
      logInfo("Usando preguntas guardadas del examen en progreso");
    } else {
      questions.value = await getQuestionsByCategory();
      localStorage.setItem("examQuestions", JSON.stringify(questions.value));
      logInfo("Nuevas preguntas cargadas y guardadas");
    }

    totalQuestions.value = questions.value.length;
    currentQuestion.value = questions.value[0] || null;

    const savedAnswers = localStorage.getItem("selectedAnswers");
    if (savedAnswers) {
      selectedAnswers.value = JSON.parse(savedAnswers);
      updateAnsweredQuestions();
    }

    const savedTime = localStorage.getItem("remainingTime");
    if (savedTime) {
      remainingTime.value = parseInt(savedTime);
    } else {
      remainingTime.value = 2400;
    }

    startTimer();
  } catch (error) {
    logError("Error al cargar las preguntas:", error);
  }

  window.addEventListener("mousemove", resize);
  window.addEventListener("mouseup", stopResizing);
  maxWidth.value = `${window.innerWidth * 0.8}px`;
  handleZoomChange(zoomLevel.value);
});

onUnmounted(() => {
  unsubscribeFromQuestions();
  window.removeEventListener("mousemove", resize);
  window.removeEventListener("mouseup", stopResizing);
  clearInterval(timer);
});

const updateAnsweredQuestions = () => {
  answeredQuestions.value = Object.keys(selectedAnswers.value).length;
};

const selectAnswer = (questionId, option) => {
  selectedAnswers.value[questionId] = option;
  updateAnsweredQuestions();
  localStorage.setItem(
      "selectedAnswers",
      JSON.stringify(selectedAnswers.value)
  );
  logDebug(`Respuesta seleccionada para la pregunta ${questionId}: ${option}`);
};

const previousQuestion = () => {
  if (!currentQuestion.value) return;
  const currentIndex = questions.value.findIndex(
      (q) => q.id === currentQuestion.value.id
  );
  if (currentIndex > 0) {
    currentQuestion.value = questions.value[currentIndex - 1];
  }
};

const nextQuestion = () => {
  if (!currentQuestion.value) return;
  const currentIndex = questions.value.findIndex(
      (q) => q.id === currentQuestion.value.id
  );
  if (currentIndex < totalQuestions.value - 1) {
    currentQuestion.value = questions.value[currentIndex + 1];
  }
};

const toggleHelpImage = () => {
  showHelpImage.value = !showHelpImage.value;
};

const openConfirmationDialog = () => {
  showConfirmationDialog.value = true;
};

const calculateScore = () => {
  let correctAnswers = 0;
  for (const [questionId, selectedAnswer] of Object.entries(selectedAnswers.value)) {
    const question = questions.value.find(q => q.id === questionId);
    if (question && getDecryptedResponse(question) === selectedAnswer) {
      correctAnswers++;
    }
  }
  return (correctAnswers / totalQuestions.value) * 100;
};

const finishExam = async () => {
  logInfo("Examen finalizado");

  try {
    const score = calculateScore();
    await saveExamResults(score);
    logInfo("Resultados del examen guardados en Firebase");

    localStorage.removeItem("selectedAnswers");
    localStorage.removeItem("remainingTime");
    localStorage.removeItem("examQuestions");
    clearInterval(timer);
    logInfo("Datos del localStorage eliminados");

    router.push({ name: "ExamFinished" });
  } catch (error) {
    logError("Error al guardar los resultados del examen:", error);
  }
};

const baseFontSize = computed(() => {
  const calculatedSize = (zoomLevel.value / 50) * 16;
  return `${Math.min(calculatedSize, 32)}px`;
});

const radioButtonSize = computed(() => {
  const calculatedSize = (zoomLevel.value / 50) * 20;
  return `${Math.min(calculatedSize, 40)}px`;
});

const isHidden = computed(() => zoomLevel.value === 0);

const handleZoomChange = (newZoom) => {
  zoomLevel.value = newZoom;
  const container = document.querySelector(".container-question");
  if (container) {
    container.style.fontSize = baseFontSize.value;
  }
};

const handleQuestionSelected = (questionId) => {
  currentQuestion.value =
      questions.value.find((q) => q.id === questionId) || null;
};

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
</script>

<template>
  <Header
    title="Examen de Conocimientos - CATEGORÍA: (A) I"
    :showMenuIcon="true"
  />

  <main class="flex-grow flex zoom-80 h-resolution">
    <SideBar
      :leftPaneWidth="leftPaneWidth"
      :maxWidth="maxWidth"
      :answeredQuestions="answeredQuestions"
      :totalQuestions="totalQuestions"
      :selectedAnswers="selectedAnswers"
      :questions="questions"
      @questionSelected="handleQuestionSelected"
    />

    <div
      class="w-1 cursor-ew-resize bg-gray-300 hover:bg-gray-400 transition-colors duration-300"
      @mousedown="startResizing"
    ></div>

    <section
      class="flex-grow bg-transparent shadow-md overflow-auto flex flex-col relative pb-[0px]"
    >
      <div class="flex-grow p-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-2">
          <div></div>
          <p class="text-red-500">
            Tiempo restante:
            <span class="font-semibold">{{ formatTime(remainingTime) }}</span>
          </p>
          <p>Intentos: 1 de 0</p>
        </div>

        <div class="bg-gray-200 h-2.5 mb-4">
          <div
            class="bg-red-600 h-full"
            :style="{ width: `${(remainingTime / 2400) * 100}%` }"
          ></div>
        </div>
        <div
          v-if="currentQuestion"
          class="bg-white px-5 rounded shadow-md container-question"
        >
          <div class="w-full h-[53px] flex items-center border-b-2">
            <h3
              class="font-semibold"
              :class="{ hidden: isHidden }"
              :style="{ fontSize: baseFontSize }"
            >
              Tema: {{ currentQuestion.TEMA }}
            </h3>
          </div>

          <div class="pb-[28px] pt-7" :class="{ hidden: isHidden }">
            <p
              class="mb-10 text-lg max-w-[1300px]"
              :style="{ fontSize: baseFontSize }"
            >
              {{ currentQuestion.DESCRIPCIÓN_DE_LA_PREGUNTA }}
            </p>
            <div
              v-if="currentQuestion.IMAGE_URL"
              class="flex justify-center mb-6"
            >
              <img
                :src="currentQuestion.IMAGE_URL"
                alt="Imagen de referencia"
                class="max-w-full h-auto"
                :style="{ width: `${(zoomLevel / 60) * 10}%` }"
              />
            </div>
            <div class="pl-6 flex flex-col gap-[27px] pb-[42px] border-b-2">
              <div
                v-for="(alternative, index) in [
                  'ALTERNATIVA_1',
                  'ALTERNATIVA_2',
                  'ALTERNATIVA_3',
                  'ALTERNATIVA_4',
                ]"
                :key="index"
                class="mb-4"
              >
                <label
                  class="flex items-center cursor-pointer"
                  :style="{ fontSize: baseFontSize }"
                >
                  <input
                    type="radio"
                    :name="`question${currentQuestion.id}`"
                    :value="currentQuestion[alternative]"
                    :checked="
                      selectedAnswers[currentQuestion.id] ===
                      currentQuestion[alternative]
                    "
                    @change="
                      selectAnswer(
                        currentQuestion.id,
                        currentQuestion[alternative]
                      )
                    "
                    :style="{ width: radioButtonSize, height: radioButtonSize }"
                    class="mr-2"
                  />
                  {{ currentQuestion[alternative] }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4">No hay preguntas disponibles.</div>
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center space-x-4">
            <button
              @click="previousQuestion"
              class="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white"
              :disabled="
                !currentQuestion || questions.indexOf(currentQuestion) === 0
              "
            >
              <ChevronLeft />
            </button>
            <span
              >{{
                currentQuestion
                  ? questions.findIndex((q) => q.id === currentQuestion.id) + 1
                  : 0
              }}/{{ totalQuestions }}</span
            >
            <button
              @click="nextQuestion"
              class="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white"
              :disabled="
                !currentQuestion ||
                questions.indexOf(currentQuestion) === questions.length - 1
              "
            >
              <ChevronRight />
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
      <div
        class="bg-transparent absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center w-full"
      >
        <button
          v-if="
            currentQuestion &&
            currentQuestion.id === questions[totalQuestions - 1]?.id
          "
          @click="openConfirmationDialog"
          class="flex items-center justify-center gap-[5px] w-[190px] shadow-shadow-btn text-[14px] bg-red-700 text-white py-[7px] rounded-[4px] hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <span class="icon-[lucide--door-closed] text-[15px]"></span>
          FINALIZAR EXAMEN
        </button>
        <ZoomControl
          :initialZoom="zoomLevel"
          @zoomChange="handleZoomChange"
          class="absolute right-4 bottom-0"
        />
      </div>
    </section>
  </main>

  <Footer />
  <HelpImage :showHelpImage="showHelpImage" @close="toggleHelpImage" />
  <ConfirmationDialog
    v-model:isVisible="showConfirmationDialog"
    @confirmed="finishExam"
  />
</template>

<style scoped>
.hidden {
  display: none;
}

::-webkit-scrollbar {
  width: 2.5px;
}

::-webkit-scrollbar-track {
  background: #f3f3f3;
}

::-webkit-scrollbar-thumb {
  background: #b8b8b8;
  border-radius: 9999px;
}

.zoom-80 {
  zoom: 87%;
}
.h-resolution {
  height: calc(100vh);
}
</style>
