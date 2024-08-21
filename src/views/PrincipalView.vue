<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Flag,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  CircleMinus,
  CirclePlus,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import PerfilImg from "@/assets/images/perfil.png";
import HelpImage from "@/components/HelpImage.vue";

// Datos y estados
const isResizing = ref(false);
const leftPaneWidth = ref("300px");
const isDropdownOpen = ref(false);
const showHelpImage = ref(false);
const router = useRouter();

const answeredQuestions = ref(0);
const totalQuestions = ref(20); // Total de preguntas, ajustar según sea necesario

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

const progressPercentage = computed(() => {
  return (answeredQuestions.value / totalQuestions.value) * 100;
});

// Funciones para manejar el tamaño del panel izquierdo
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

    if (newWidth < 300) {
      newWidth = 300;
    } else if (newWidth > containerWidth / 2) {
      newWidth = containerWidth / 2;
    }

    leftPaneWidth.value = `${newWidth}px`;
  }
};

onMounted(() => {
  window.addEventListener("mousemove", resize);
  window.addEventListener("mouseup", stopResizing);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", resize);
  window.removeEventListener("mouseup", stopResizing);
});

// Funciones para el menú desplegable
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleTopic = (id) => {
  const topic = topics.value.find((t) => t.id === id);
  topic.expanded = !topic.expanded;
};

const markAsAnswered = () => {
  answeredQuestions.value += 1;
};

// Funciones para la navegación de preguntas
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

const finishExam = () => {
  console.log("Examen finalizado");
  router.push({ name: "ExamFinished" });
};

const topics = ref([
  { id: 1, title: "Obligaciones del conductor", expanded: true },
  { id: 2, title: "Señales de tránsito", expanded: false },
  { id: 3, title: "Normas de circulación", expanded: false },
  { id: 4, title: "Seguridad vial", expanded: false },
]);

// Estado para el zoom
const zoomLevel = ref(100);

// Computed para el tamaño de fuente base
const baseFontSize = computed(() => {
  const calculatedSize = (zoomLevel.value / 100) * 16;
  return `${Math.min(calculatedSize, 20.8)}px`;
});

// Funciones para manejar el zoom
const handleZoom = () => {
  const container = document.querySelector(".container-question");
  container.style.fontSize = baseFontSize.value;
};

const decreaseZoom = () => {
  if (zoomLevel.value > 100) {
    zoomLevel.value -= 1;
    handleZoom();
  }
};

const increaseZoom = () => {
  if (zoomLevel.value < 150) {
    zoomLevel.value += 1;
    handleZoom();
  }
};

onMounted(() => {
  handleZoom();
});
</script>

<template>
  <Header
    title="Examen de Conocimientos - CATEGORÍA: (A) I"
    :showMenuIcon="true"
    @toggle-sidebar="toggleSidebar"
  />

  <main class="main flex">
    <aside class="left-pane py-[20px]" :style="{ width: leftPaneWidth }">
      <div class="flex flex-col gap-[10px] items-center border-b-2 pb-[20px]">
        <h1 class="uppercase text-size-18 text-red-600 font-medium">
          Postulante
        </h1>
        <img
          :src="PerfilImg"
          alt=""
          class="w-[150px] p-[5px] border rounded-[5px]"
        />
        <p class="uppercase text-size-16 font-medium">
          Juan Isaias Rojas Pariona
        </p>
      </div>
      <!-- Perfil -->
      <div class="contenedor">
        <nav class="px-3 flex-grow overflow-y-auto">
          <div v-for="topic in topics" :key="topic.id" class="border-b-2">
            <div
              @click="toggleTopic(topic.id)"
              class="flex items-center justify-between cursor-pointer h-[45px] bg-gray-50 pl-[20px]"
            >
              <h3 class="font-medium">{{ topic.title }}</h3>
              <ChevronDown v-if="!topic.expanded" />
              <ChevronUp v-else />
            </div>

            <ul v-if="topic.expanded" class="space-y-1 text-sm mt-2">
              <li
                v-for="n in 5"
                :key="n"
                class="option flex items-center justify-between h-[45px]"
              >
                <label :for="`question${topic.id}-${n}`" class="truncate">
                  {{ n }}. ¿Qué indicaciones o información hay que dar al 112 si
                  vemos un accidente? {{ n }}
                </label>
                <div
                  class="circle-alrt rounded-full fixed-size border-2 border-red-400 circle"
                ></div>
              </li>
            </ul>
          </div>
        </nav>
        <!-- Nav -->
        <div class="resumen p-3 border-t-2">
          <div class="w-full bg-red-600 rounded-full h-4 mb-2">
            <div
              class="bg-red-300 h-4 rounded-full"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-sm">
            <p>
              Resumen de preguntas ({{ answeredQuestions }}/{{
                totalQuestions
              }})
            </p>
            <p>{{ progressPercentage.toFixed(0) }}%</p>
          </div>
        </div>
      </div>
    </aside>

    <div class="resizer" @mousedown="startResizing"></div>
    <section class="right-pane">
      <div class="flex-grow p-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-2">
          <div></div>
          <p
            class="text-size-16 text-red-500"
            :style="{ fontSize: baseFontSize }"
          >
            Tiempo restante:
            <span class="font-semibold">{{ remainingTime }}</span>
          </p>
          <p class="text-size-16" :style="{ fontSize: baseFontSize }">
            Intentos: 1 de 0
          </p>
        </div>

        <div class="bg-gray-200 h-[10px] mb-4">
          <div class="bg-red-600 h-full w-1/2"></div>
        </div>
        <div class="bg-white px-[19px] pb-[27px] rounded container-question">
          <div class="w-full h-[53px] flex items-center border-b-2">
            <h3
              class="text-size-16 font-semibold"
              :style="{ fontSize: baseFontSize }"
            >
              Tema: Obligaciones del conductor en materia de tránsito terrestre
            </h3>
          </div>

          <div
            v-for="question in questions"
            :key="question.id"
            v-show="question.id === currentQuestion"
            class="pb-[44px] pt-[27px]"
          >
            <p class="mb-[39px] text-lg" :style="{ fontSize: baseFontSize }">
              {{ question.id }}. {{ question.text }}
            </p>
            <div v-if="question.imageUrl" class="flex justify-center mb-6">
              <img
                :src="question.imageUrl"
                alt="Imagen de referencia"
                class="max-w-full h-auto"
              />
            </div>
            <div class="pl-6 flex flex-col gap-[31px]">
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
              <ChevronLeft />
            </button>
            <span>{{ currentQuestion }}/{{ totalQuestions }}</span>
            <button
              @click="nextQuestion"
              class="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white"
            >
              <ChevronRight />
            </button>
          </div>
          <button
            @click="toggleHelpImage"
            class="bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            AYUDA PARA EL USO DEL TECLADO
          </button>
        </div>
        <div
          v-if="currentQuestion === totalQuestions"
          class="flex justify-center mt-8"
        >
          <button
            @click="finishExam"
            class="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition duration-300 flex items-center"
          >
            <Flag class="w-4 h-4 mr-2" />
            FINALIZAR EXAMEN
          </button>
        </div>
      </div>
      <!-- Barra de zoom -->
      <div class="zoom-bar absolute bottom-[50px] right-4 flex items-center">
        <span class="mr-[18px]">{{ zoomLevel }}%</span>
        <CircleMinus @click="decreaseZoom" class="mr-2 cursor-pointer" />
        <input
          type="range"
          id="zoomRange"
          min="100"
          max="130"
          v-model="zoomLevel"
          @input="handleZoom"
          class="w-[150px] mr-2"
        />
        <CirclePlus @click="increaseZoom" class="mr-2 cursor-pointer" />
      </div>
    </section>
  </main>

  <Footer />
  <HelpImage :showHelpImage="showHelpImage" @close="toggleHelpImage" />
</template>

<style scoped>
.circle-alrt {
  width: 35px;
  height: 35px;
  flex-shrink: 0; /* Evita que el tamaño cambie si el contenedor cambia */
}
.main {
  height: calc(100vh - 115px);
  display: flex;
}

.left-pane {
  min-width: 300px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.contenedor {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%; /* Asegura que el contenedor ocupe toda la altura disponible */
  overflow-y: auto; /* Permite el desplazamiento vertical del contenido */
}

.container-question {
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);
}
.contenedor nav {
  flex: 1; /* Permite que el nav tome todo el espacio disponible en el contenedor */
}

.right-pane {
  flex-grow: 1;
  background-color: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);
}

.resizer {
  width: 5px;
  cursor: ew-resize;
  background-color: #ccc;
}

.hidden {
  display: none;
}

.option {
  border-top: 0.01px solid #f8f8f8a8;
  /* Añade flexbox para mantener el tamaño del div constante */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rounded-full.fixed-size {
  /* Define un tamaño fijo para el div */
  width: 30px;
  height: 30px;
  border: 1px solid #f87171; /* Color rojo más claro */
}

::-webkit-scrollbar {
  width: 10px; /* Ajusta el ancho de la barra */
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* border-radius: 10px;  */
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px; /* Ajusta el radio de los bordes del thumb */
}
.zoom-bar {
  /* background: rgba(255, 255, 255, 0.8); */
  padding: 5px;
  border-radius: 5px;
}
</style>
