<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ChevronRight, ChevronLeft } from "lucide-vue-next";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import HelpImage from "@/components/HelpImage.vue";
import SideBar from "@/components/home/SideBar.vue";
import ZoomControl from "@/components/home/ZoomControl.vue";
import ConfirmationDialog from "@/components/home/ConfirmationDialog.vue";
import { logInfo, logError, logDebug } from "@/utils/logger.js";
import { getQuestionsByCategory, unsubscribeFromQuestions } from "@/services/questions_service.js";
import { saveExamResults } from "@/services/results_service.js";
import { formatTime, getImageUrl, isImageAlternative, calculateScore, useExamState } from "@/utils/exam_utils.js";

const router = useRouter();

const {
  isResizing,
  leftPaneWidth,
  maxWidth,
  showHelpImage,
  questions,
  answeredQuestions,
  totalQuestions,
  currentQuestion,
  selectedAnswers,
  remainingTime,
  showConfirmationDialog,
  zoomLevel
} = useExamState();

let timer;

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
    questions.value = await getQuestionsByCategory();
    totalQuestions.value = questions.value.length;
    currentQuestion.value = questions.value[0] || null;
    logInfo(`Se cargaron ${totalQuestions.value} preguntas`);

    // Log para verificar que las preguntas tienen la respuesta correcta
    questions.value.forEach((q, index) => {
      logDebug(`Pregunta ${index + 1} - Respuesta correcta: ${q.RESPUESTA}`);
    });

    const savedAnswers = localStorage.getItem("selectedAnswers");
    if (savedAnswers) {
      selectedAnswers.value = JSON.parse(savedAnswers);
      updateAnsweredQuestions();
    }

    const savedTime = localStorage.getItem("remainingTime");
    if (savedTime) {
      remainingTime.value = parseInt(savedTime);
    }

    startTimer();
  } catch (error) {
    logError("Error al cargar las preguntas:", error);
  }

  window.addEventListener("mousemove", resize);
  window.addEventListener("mouseup", stopResizing);
  maxWidth.value = `${window.innerWidth * 0.8}px`;
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
  localStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers.value));
  logDebug(`Respuesta seleccionada para la pregunta ${questionId}: ${option}`);
};

const previousQuestion = () => {
  if (!currentQuestion.value) return;
  const currentIndex = questions.value.findIndex((q) => q.id === currentQuestion.value.id);
  if (currentIndex > 0) {
    currentQuestion.value = questions.value[currentIndex - 1];
  }
};

const nextQuestion = () => {
  if (!currentQuestion.value) return;
  const currentIndex = questions.value.findIndex((q) => q.id === currentQuestion.value.id);
  if (currentIndex < questions.value.length - 1) {
    currentQuestion.value = questions.value[currentIndex + 1];
  }
};

const toggleHelpImage = () => {
  showHelpImage.value = !showHelpImage.value;
};

const openConfirmationDialog = () => {
  showConfirmationDialog.value = true;
};

const finishExam = async () => {
  try {
    let correctAnswers = 0;
    for (let i = 0; i < questions.value.length; i++) {
      const question = questions.value[i];
      const questionId = question.id;
      const isAnswered = selectedAnswers.value.hasOwnProperty(questionId);
      const selectedAnswer = selectedAnswers.value[questionId] || "No respondida";
      const correctAnswer = question.RESPUESTA || "No disponible";
      const isCorrect = selectedAnswer.charAt(0) === correctAnswer;

      if (isCorrect) correctAnswers++;
    }

    const score = calculateScore(selectedAnswers.value, questions.value);

    await saveExamResults(score);

    localStorage.removeItem("selectedAnswers");
    localStorage.removeItem("remainingTime");
    clearInterval(timer);

    router.push({ name: "ExamFinished" });
  } catch (error) {
    logError("Error al guardar los resultados del examen:", error);
  }
};

const handleZoomChange = (newZoom) => {
  zoomLevel.value = newZoom;
};

const handleQuestionSelected = (questionId) => {
  currentQuestion.value = questions.value.find((q) => q.id === questionId) || null;
};

const startResizing = () => {
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

// Computed properties
const baseFontSize = computed(() => {
  const calculatedSize = (zoomLevel.value / 50) * 16;
  return `${Math.min(calculatedSize, 32)}px`;
});

const radioButtonSize = computed(() => {
  const calculatedSize = (zoomLevel.value / 50) * 20;
  return `${Math.min(calculatedSize, 40)}px`;
});

const isHidden = computed(() => zoomLevel.value === 0);

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

        <div class="bg-red-500 h-3 mb-4">
          <div
              class="bg-red-700 h-full"
              :style="{ width: ((2400 - remainingTime) / 2400) * 100 + '%' }"
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
                  :style="{ width: (zoomLevel / 60) * 10 + '%' }"
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
                  <div class="flex items-center">
                    <input
                        type="radio"
                        :name="`question${currentQuestion.id}`"
                        :value="currentQuestion[alternative]"
                        v-model="selectedAnswers[currentQuestion.id]"
                        :style="{ width: radioButtonSize, height: radioButtonSize }"
                        class="mr-2 accent-red-600"
                        @change="selectAnswer(currentQuestion.id, currentQuestion[alternative])"
                    />
                    <span>
                      {{ isImageAlternative(currentQuestion[alternative])
                        ? currentQuestion[alternative].split('.')[0]
                        : currentQuestion[alternative] }}
                    </span>
                  </div>
                  <img
                      v-if="isImageAlternative(currentQuestion[alternative])"
                      :src="getImageUrl(currentQuestion[alternative])"
                      :alt="`Imagen para ${alternative}`"
                      class="ml-2 max-w-full h-auto"
                      :style="{ width: (zoomLevel / 60) * 10 + '%' }"
                      @error="logError(`Error al cargar la imagen ${currentQuestion[alternative]}:`)"
                  />
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