<script setup>
import { ref } from "vue";
import { defineProps, defineEmits } from "vue";
import { Menu } from "lucide-vue-next";
import Sidebar from "./home/NabBar.vue";
import { logInfo } from '@/utils/logger.js';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  showMenuIcon: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["toggle-sidebar"]);

const isSidebarVisible = ref(false);

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
  emit("toggle-sidebar");
  logInfo("Sidebar toggled");
};
</script>

<template>
  <header
      class="bg-red-700 text-white h-[87px] p-[15px] flex items-center justify-between responsive-header"
  >
    <div class="w-[250px] flex items-center">
      <button v-if="showMenuIcon" @click="toggleSidebar" class="mr-4">
        <Menu class="w-[30px] h-[30px] responsive-icon"/>
      </button>
    </div>
    <h2
        class="text-[22px] tracking-[-0.88px] font-normal whitespace-nowrap overflow-hidden overflow-ellipsis flex-grow text-center responsive-title"
    >
      {{ title }}
    </h2>
    <div class="h-[54px] w-[250px] flex justify-end">
      <img
          src="@/assets/images/logo-mtc.png"
          alt="MTC Logo"
          class="w-full right-2 py-1 object-contain responsive-logo"
      />
    </div>
  </header>

  <Sidebar :isVisible="isSidebarVisible" @close="isSidebarVisible = false"/>
</template>

<style scoped>
header {
  box-shadow: 0px 4px 11.3px 0px rgba(0, 0, 0, 0.25);
}

@media screen and (max-width: 1599px) {
  .responsive-header {
    height: 78px; /* Reducción del 10% de 87px */
    padding-top: 13.5px; /* Reducción del 10% de 15px */
    padding-bottom: 13.5px; /* Reducción del 10% de 15px */
  }

  .responsive-title {
    font-size: 19.8px; /* Reducción del 10% de 22px */
  }

  .responsive-logo {
    height: 48.6px; /* Reducción del 10% de 54px */
  }

  .responsive-icon {
    width: 27px; /* Reducción del 10% de 30px */
    height: 27px; /* Reducción del 10% de 30px */
  }
}
</style>
