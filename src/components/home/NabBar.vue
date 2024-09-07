<script setup>
import { ref, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import { logInfo, logError } from '@/utils/logger.js';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  menuItems: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "Menu",
  },
  closeButtonAriaLabel: {
    type: String,
    default: "Close menu",
  },
});

const emit = defineEmits(["close"]);
const defaultImagePath = new URL('@/assets/images/perfil.png', import.meta.url).href;

const closeDrawer = () => {
  emit("close");
};

const userData = ref(null);

onMounted(() => {
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    userData.value = JSON.parse(storedUserData);
    logInfo('Datos del usuario cargados correctamente en el drawer');
  } else {
    logError('No se encontraron datos del usuario en localStorage para el drawer');
  }
});
</script>

<template>
  <div
      id="drawer-navigation"
      :class="[
      'fixed top-0 left-0 z-40 w-[212px] h-screen px-[6px] py-[10px] overflow-y-auto transition-transform bg-color-gray-bg border-[1px] border-color-gray-line',
      isVisible ? 'translate-x-0' : '-translate-x-full',
    ]"
      tabindex="-1"
      aria-labelledby="drawer-navigation-label"
  >
    <button
        type="button"
        @click="closeDrawer"
        :aria-controls="'drawer-navigation'"
        :aria-label="closeButtonAriaLabel"
        class="text-black bg-transparent w-full flex justify-end mb-[10px]"
    >
      <span class="icon-[material-symbols--arrow-left-alt] text-[40px]"></span>
      <span class="sr-only">{{ closeButtonAriaLabel }}</span>
    </button>
    <div class="w-full flex flex-col gap-[1px]">
      <div
          class="w-full rounded-[2px] bg-color-red-bg h-[140px] shadow-shadow-container flex justify-center items-center"
      >
        <div
            class="w-[70px] h-[70px] overflow-hidden rounded-full clip-custom"
        >
          <img :src="userData?.imagenUrl || defaultImagePath" alt="Perfil" class="w-full h-full object-cover" />
        </div>
      </div>
      <div
          class="container-name w-full rounded-[2px] bg-white h-[99px] shadow-shadow-container flex flex-col"
      >
        <div class="h-[90px] flex justify-center items-center">
          <h1>{{ userData?.nombre }} {{ userData?.apellidos }}</h1>
        </div>
        <div class="w-full h-[1px] bg-color-gray-line"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clip-custom {
  clip-path: circle(50%);
}
.container-name h1 {
  color: #000;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 121.017%; /* 14.522px */
  letter-spacing: 0.36px;
  text-transform: uppercase;
}
</style>
