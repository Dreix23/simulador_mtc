<script setup>
import { Loader2, FileDown, FileUp, UserPlus } from "lucide-vue-next";

const props = defineProps({
  isLoading: Boolean,
  icon: String,
  text: String,
  color: String,
  disabled: Boolean
});

const getIcon = () => {
  switch (props.icon) {
    case 'FileDown': return FileDown;
    case 'FileUp': return FileUp;
    case 'UserPlus': return UserPlus;
    default: return null;
  }
};

const getColorClass = () => {
  switch (props.color) {
    case 'green': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
    case 'blue': return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
    default: return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
  }
};
</script>

<template>
  <button
      @click="!disabled && !isLoading && $emit('click')"
      :disabled="disabled || isLoading"
      :class="[
      'w-40 cursor-pointer inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 h-12',
      getColorClass(),
      { 'opacity-50 cursor-not-allowed': disabled || isLoading }
    ]"
  >
    <Loader2 v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
    <component :is="getIcon()" v-else class="-ml-1 mr-3 h-5 w-5" />
    {{ text }}
  </button>
</template>

<style scoped>
</style>