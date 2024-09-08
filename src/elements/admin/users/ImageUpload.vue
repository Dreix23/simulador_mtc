<script setup>
import { ImageUp } from "lucide-vue-next";

defineProps({
  modelValue: File
});

defineEmits(['update:modelValue', 'change']);
</script>

<template>
  <div class="h-full">
    <div class="w-40">
      <input
          type="file"
          id="imagen"
          @change="$emit('change', $event)"
          accept="image/*"
          class="sr-only"
      />
      <label
          for="imagen"
          class="cursor-pointer bg-white py-2 px-3 border-2 border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-12 flex items-center justify-center w-full"
      >
        <ImageUp class="h-5 w-5 mr-2" />
        <span class="truncate">{{ modelValue ? modelValue.name : "Imagen" }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>

</style>