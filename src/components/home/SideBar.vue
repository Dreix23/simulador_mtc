<script setup>
import { ref, computed, onMounted } from "vue";
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import PerfilImg from "@/assets/images/perfil.png";

const props = defineProps({
  leftPaneWidth: {
    type: String,
    required: true,
  },
  maxWidth: {
    type: String,
    required: true,
  },
  answeredQuestions: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
});

const isDropdownOpen = ref(false);
const scrollActive = ref(false);

const progressPercentage = computed(() => {
  return (props.answeredQuestions / props.totalQuestions) * 100;
});

const topics = ref([
  { id: 1, title: "Obligaciones del conductor", expanded: true },
  { id: 2, title: "Señales de tránsito", expanded: false },
  { id: 3, title: "Normas de circulación", expanded: false },
  { id: 4, title: "Seguridad vial", expanded: false },
]);

const toggleTopic = (id) => {
  const topic = topics.value.find((t) => t.id === id);
  topic.expanded = !topic.expanded;
  checkScroll();
};

const checkScroll = () => {
  requestAnimationFrame(() => {
    const container = document.querySelector(".container-question");
    if (container) {
      scrollActive.value = container.scrollHeight > container.clientHeight;
    }
  });
};

onMounted(() => {
  checkScroll();
});
</script>

<template>
  <aside
    class="left-pane py-[20px]"
    :style="{ width: leftPaneWidth, maxWidth: maxWidth }"
  >
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
    <div class="contenedor">
      <nav
        class="container-question px-3 flex-grow overflow-y-auto"
        :class="{ 'pr-0': scrollActive }"
      >
        <div v-for="topic in topics" :key="topic.id" class="border-b-2">
          <div
            @click="toggleTopic(topic.id)"
            class="flex items-center justify-between cursor-pointer h-[45px] bg-gray-50 pl-[20px]"
          >
            <h3 class="font-medium">{{ topic.title }}</h3>
            <ChevronDown v-if="!topic.expanded" />
            <ChevronUp v-else />
          </div>
          <ul
            v-if="topic.expanded"
            class="space-y-1 text-sm mt-2 flex flex-col gap-[3px]"
          >
            <li
              v-for="n in 5"
              :key="n"
              class="option flex items-center justify-between h-[45px] hover:bg-custom-red hover:text-white transition-colors duration-200 ease-in-out rounded-md"
            >
              <label
                :for="`question${topic.id}-${n}`"
                class="pl-[20px] cursor-pointer flex-grow truncate-label"
              >
                {{ n }}. ¿Qué indicaciones o información hay que dar al 112 si
                vemos un accidente? {{ n }}
              </label>
              <div
                class="circle-alrt rounded-full fixed-size border-2 border-red-400 circle mr-2"
              ></div>
            </li>
          </ul>
        </div>
      </nav>
      <div class="resumen p-3 border-t-2">
        <div class="w-full bg-red-600 rounded-full h-4 mb-2">
          <div
            class="bg-red-300 h-4 rounded-full"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-sm">
          <p>
            Resumen de preguntas ({{ answeredQuestions }}/{{ totalQuestions }})
          </p>
          <p>{{ progressPercentage.toFixed(0) }}%</p>
        </div>
      </div>
    </div>
  </aside>
</template>
<style scoped>
.circle-alrt {
  width: 35px;
  height: 35px;
  flex-shrink: 0;
}

.left-pane {
  min-width: 300px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.15s ease;
  font-size: 16px; /* Asegurar tamaño de fuente fijo */
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

* {
  font-size: 16px; /* Tamaño de fuente fijo para todo el componente */
}
</style>
