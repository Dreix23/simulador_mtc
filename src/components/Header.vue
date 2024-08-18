<script setup>
import { defineProps, defineEmits } from 'vue';
import { Menu } from 'lucide-vue-next';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  showMenuIcon: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle-sidebar']);

const toggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>

<template>
  <header class="bg-red-700 text-white py-2 px-2 flex items-center relative">
    <button v-if="showMenuIcon" @click="toggleSidebar" class="mr-0">
      <Menu class="w-6 h-6" />
    </button>
    <h2 class="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-center w-full min-w-0">
      {{ title }}
    </h2>
    <img src="@/assets/images/logo-mtc.png" alt="MTC Logo" class="h-10 w-auto absolute right-2 py-1 object-contain">
  </header>
</template>

<style scoped>
/* Añadir estilos si es necesario */
</style>
