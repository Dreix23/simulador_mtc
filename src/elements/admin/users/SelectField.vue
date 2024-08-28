<script setup>
defineProps({
  id: String,
  modelValue: String,
  label: String,
  options: Array,
  flex: Number
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div :class="[`flex-[${flex}]`]">
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
    <select
        :id="id"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3 cursor-pointer"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
