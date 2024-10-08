<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { logInfo, logError } from '@/utils/logger.js';

const props = defineProps({
  leftPaneWidth: {
    type: String,
    required: true,
  },
  maxWidth: {
    type: String,
    required: true,
  },
  selectedAnswers: {
    type: Object,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['questionSelected']);
const defaultImagePath = new URL('@/assets/images/perfil.png', import.meta.url).href;

const scrollActive = ref(false);
const userData = ref(null);
const topics = ref([]);

const answeredQuestionsCount = computed(() => Object.keys(props.selectedAnswers).length);

const progressPercentage = computed(() => {
  const totalQuestions = props.questions.length;
  return totalQuestions > 0 ? (answeredQuestionsCount.value / totalQuestions) * 100 : 0;
});

const groupQuestionsByTopic = () => {
  const groupedQuestions = props.questions.reduce((acc, question) => {
    if (!acc[question.TEMA]) {
      acc[question.TEMA] = [];
    }
    acc[question.TEMA].push(question);
    return acc;
  }, {});

  topics.value = Object.keys(groupedQuestions).map((topic, index) => ({
    id: index + 1,
    title: topic,
    expanded: index === 0,
    questions: groupedQuestions[topic],
  }));
};

const toggleTopic = (id) => {
  const topic = topics.value.find((t) => t.id === id);
  if (topic) {
    topic.expanded = !topic.expanded;
    checkScroll();
  }
};

const checkScroll = () => {
  requestAnimationFrame(() => {
    const container = document.querySelector(".sidebar-img-questions");
    if (container) {
      scrollActive.value = container.scrollHeight > container.clientHeight;
    }
  });
};

const selectQuestion = (questionId) => {
  emit('questionSelected', questionId);
};

const getQuestionStatus = (questionId) => {
  return props.selectedAnswers[questionId] ? 'answered' : 'unanswered';
};

const getSelectedAlternative = (questionId) => {
  if (props.selectedAnswers[questionId]) {
    const question = props.questions.find(q => q.id === questionId);
    if (question) {
      const alternatives = ['ALTERNATIVA_1', 'ALTERNATIVA_2', 'ALTERNATIVA_3', 'ALTERNATIVA_4'];
      const index = alternatives.findIndex(alt => question[alt] === props.selectedAnswers[questionId]);
      return ['A', 'B', 'C', 'D'][index] || '';
    }
  }
  return '';
};

onMounted(() => {
  groupQuestionsByTopic();
  checkScroll();
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    userData.value = JSON.parse(storedUserData);
    logInfo('Datos del usuario cargados correctamente en SideBar');
  } else {
    logError('No se encontraron datos del usuario en localStorage en SideBar');
  }
});

watch(() => props.questions, () => {
  groupQuestionsByTopic();
}, { deep: true });

watch(() => props.selectedAnswers, () => {
  topics.value = [...topics.value];
}, { deep: true });
</script>

<template>
  <aside
      class="left-pane pt-[20px]"
      :style="{ width: leftPaneWidth, maxWidth: maxWidth }"
  >
    <div class="h-[250px] flex flex-col gap-[10px] items-center justify-center border-b-2 pb-[20px]">
      <h1 class="uppercase text-size-18 text-red-600 font-medium">
        Postulante
      </h1>
      <img
          :src="userData?.imagenUrl || defaultImagePath"
          alt="Imagen de perfil"
          class="w-[112px] h-[122px] p-[5px] border rounded-[5px] object-contain"
      />
      <p class="uppercase text-size-16 font-medium">
        {{ userData?.nombre }} {{ userData?.apellidos }}
      </p>
    </div>
    <div class="contenedor">
      <nav
          class="container-question px-3 flex-grow overflow-y-auto sidebar-questions"
          :class="{ 'pr-0': scrollActive }"
      >
        <div v-for="topic in topics" :key="topic.id" class="border-b-2">
          <div
              @click="toggleTopic(topic.id)"
              class="flex items-center justify-between cursor-pointer h-[55.2px] bg-gray-50 pl-[20px]"
          >
            <h3 class="font-medium truncate-topic">{{ topic.title }}</h3>
            <ChevronDown v-if="!topic.expanded" />
            <ChevronUp v-else />
          </div>
          <ul
              v-if="topic.expanded"
              class="space-y-1 text-sm mt-2 flex flex-col gap-[5px]"
          >
            <li
                v-for="question in topic.questions"
                :key="question.id"
                @click="selectQuestion(question.id)"
                class="option flex items-center justify-between h-[38px] hover:bg-custom-red hover:text-white transition-colors duration-200 ease-in-out rounded-md cursor-pointer"
            >
              <label
                  :for="`question${topic.id}-${question.id}`"
                  class="pl-[20px] cursor-pointer flex-grow truncate-label"
              >
                {{ question.DESCRIPCIÓN_DE_LA_PREGUNTA }}
              </label>
              <div
                  class="circle-alrt rounded-full fixed-size border-[1px] mr-2 flex items-center justify-center"
                  :class="{
                  'border-gray-400': getQuestionStatus(question.id) === 'unanswered',
                  'border-red-400': getQuestionStatus(question.id) === 'answered'
                }"
              >
                <span class="text-black">{{ getSelectedAlternative(question.id) }}</span>
              </div>
            </li>
          </ul>
        </div>
      </nav>
      <div class="resumen p-3 border-t-2">
        <div class="w-full bg-red-700 h-3 mb-2">
          <div
              class="bg-red-400 h-3"
              :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-sm">
          <p>
            Resumen de preguntas ({{ answeredQuestionsCount }}/{{ questions.length }})
          </p>
          <p>{{ progressPercentage.toFixed(0) }}%</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.circle-alrt {
  width: 25px !important;
  height: 25px !important;
  flex-shrink: 0;
  font-weight: bold;
}

.circle-alrt span{
  font-size: 18px !important;
}
.left-pane {
  min-width: 300px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.15s ease;
  font-size: 16px;
}

.contenedor {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.contenedor nav {
  flex: 1;
}

.option {
  border-top: 1px solid #f6f6f6;
  border-bottom: 1px solid #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease-in-out;
}

.rounded-full.fixed-size {
  width: 30px;
  height: 30px;
  border: 1px solid #f87171;
}

.hover\:bg-custom-red:hover {
  background-color: #f44336;
  box-shadow: inset 0 4px 0 rgba(255, 255, 255, 0.2),
  inset 0 -4px 0 rgba(0, 0, 0, 0.2);
}

.pr-0 {
  padding-right: 0 !important;
}

.truncate-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 50px);
}

.truncate-topic {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 30px);
}

* {
  font-size: 16px;
}

.resumen .bg-red-700 {
  background-color: #f53d30;
}

.resumen .bg-red-400 {
  background-color: #b91c1c;
}
</style>
