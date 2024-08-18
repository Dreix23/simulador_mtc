<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { User, ChevronDown, ChevronUp, Flag } from 'lucide-vue-next';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import HelpImage from '@/components/HelpImage.vue';

const sidebarVisible = ref(true);
const remainingTime = ref('00:40:00');
const currentQuestion = ref(1);
const totalQuestions = ref(40);
const answeredQuestions = ref(0);
const showHelpImage = ref(false);
const router = useRouter();

const topics = ref([
  { id: 1, title: 'Obligaciones del conductor', expanded: true },
  { id: 2, title: 'Señales de tránsito', expanded: false },
  { id: 3, title: 'Normas de circulación', expanded: false },
  { id: 4, title: 'Seguridad vial', expanded: false },
]);

const questions = ref([
  {
    id: 1,
    text: '¿Se puede conducir un vehículo con el motor en punto neutro?',
    options: [
      'A. Algunas veces',
      'B. No se encuentra regulado en el reglamento',
      'C. Sí, está permitido',
      'D. No, está prohibido'
    ]
  },
  {
    "id": 2,
    "text": "¿Qué indica la siguiente señal de tránsito?",
    "imageUrl": "https://via.placeholder.com/150",
    "options": [
      "A. Prohibido el paso de vehículos",
      "B. Zona de estacionamiento",
      "C. Contramano o sentido contrario",
      "D. Velocidad máxima permitida"
    ]
  }

]);

const selectedAnswers = ref({});

const selectAnswer = (questionId, answer) => {
  if (!selectedAnswers.value[questionId]) {
    answeredQuestions.value++;
  }
  selectedAnswers.value[questionId] = answer;
};

const nextQuestion = () => {
  if (currentQuestion.value < totalQuestions.value) {
    currentQuestion.value++;
  }
};

const previousQuestion = () => {
  if (currentQuestion.value > 1) {
    currentQuestion.value--;
  }
};

const progressPercentage = computed(() => {
  return (answeredQuestions.value / totalQuestions.value) * 100;
});

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

const toggleHelpImage = () => {
  showHelpImage.value = !showHelpImage.value;
};

const toggleTopic = (topicId) => {
  topics.value = topics.value.map(topic => {
    if (topic.id === topicId) {
      return {...topic, expanded: !topic.expanded};
    } else {
      return {...topic, expanded: false};
    }
  });
};

const finishExam = () => {
  console.log('Examen finalizado');
  router.push({name: 'ExamFinished'});
};
</script>

<template>
  <div class="flex flex-col h-screen">
    <Header
        title="Examen de Conocimientos - CATEGORÍA: (A) I" :showMenuIcon="true" @toggle-sidebar="toggleSidebar"
    />

    <main class="flex-grow flex overflow-hidden">
      <aside
          v-show="sidebarVisible"
          class="w-1/5 bg-white border-r border-gray-300 flex flex-col overflow-hidden md:flex"
      >
        <div class="p-3 pb-4">
          <h2 class="text-red-600 font-semibold mb-4 text-center text-base">POSTULANTE</h2>
          <div class="flex flex-col items-center">
            <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <User class="w-20 h-20 text-gray-500"/>
            </div>
            <p class="text-sm text-center font-medium">JUAN ISAIAS ROJAS RARIONA</p>
          </div>
        </div>
        <hr class="border-gray-300"/>
        <nav class="p-3 pt-4 flex-grow overflow-y-auto">
          <div v-for="topic in topics" :key="topic.id" class="mb-4">
            <div
                @click="toggleTopic(topic.id)"
                class="flex items-center justify-between cursor-pointer"
            >
              <h3 class="font-medium text-base">{{ topic.title }}</h3>
              <ChevronDown v-if="!topic.expanded" class="w-5 h-5"/>
              <ChevronUp v-else class="w-5 h-5"/>
            </div>
            <ul v-if="topic.expanded" class="space-y-1 text-sm mt-2">
              <li v-for="n in 5" :key="n" class="flex items-center">
                <input type="radio" :id="`question${topic.id}-${n}`" name="questionNav" class="mr-2">
                <label :for="`question${topic.id}-${n}`" class="truncate">{{ n }}. Pregunta {{ n }}</label>
              </li>
            </ul>
          </div>
        </nav>
        <div class="p-3 border-t border-gray-300">
          <div class="w-full bg-red-600 rounded-full h-4 mb-2">
            <div class="bg-red-300 h-4 rounded-full" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
          <div class="flex justify-between text-sm">
            <p>Resumen de preguntas ({{ answeredQuestions }}/{{ totalQuestions }})</p>
            <p>{{ progressPercentage.toFixed(0) }}%</p>
          </div>
        </div>
      </aside>

      <div class="flex-grow p-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-2">
          <p class="text-sm">Tiempo restante: {{ remainingTime }}</p>
          <p class="text-sm">Intentos: 1 de 0</p>
        </div>
        <div class="bg-gray-200 h-2 mb-4">
          <div class="bg-red-600 h-full w-1/2"></div>
        </div>
        <div class="bg-white p-4 rounded shadow-lg">
          <h3 class="text-lg font-medium mb-4">Tema: Obligaciones del conductor en materia de tránsito terrestre</h3>
          <div v-for="question in questions" :key="question.id" v-show="question.id === currentQuestion">
            <p class="mb-6 text-lg">{{ question.id }}. {{ question.text }}</p>
            <div v-if="question.imageUrl" class="flex justify-center mb-6">
              <img :src="question.imageUrl" alt="Imagen de referencia" class="max-w-full h-auto">
            </div>
            <div class="pl-6">
              <div v-for="option in question.options" :key="option" class="mb-4">
                <label class="flex items-center">
                  <input
                      type="radio"
                      :name="`question${question.id}`"
                      :value="option"
                      :checked="selectedAnswers[question.id] === option"
                      @change="selectAnswer(question.id, option)"
                      class="mr-2"
                  >
                  {{ option }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center space-x-4">
            <button @click="previousQuestion"
                    class="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white">&lt;
            </button>
            <span>{{ currentQuestion }}/{{ totalQuestions }}</span>
            <button @click="nextQuestion"
                    class="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white">&gt;
            </button>
          </div>
          <button @click="toggleHelpImage" class="bg-red-600 text-white px-4 py-2 rounded text-sm">AYUDA PARA EL USO DEL
            TECLADO
          </button>
        </div>
        <div v-if="currentQuestion === totalQuestions" class="flex justify-center mt-8">
          <button @click="finishExam"
                  class="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition duration-300 flex items-center">
            <Flag class="w-4 h-4 mr-2"/>
            FINALIZAR EXAMEN
          </button>
        </div>
      </div>
    </main>

    <Footer/>

    <HelpImage :showHelpImage="showHelpImage" @close="toggleHelpImage"/>
  </div>
</template>

<style scoped>
/* Añadir estilos si es necesario */
</style>
