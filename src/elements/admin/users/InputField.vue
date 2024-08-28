<script setup>
defineProps({
  id: String,
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  maxlength: String,
  flex: Number
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div :class="[`flex-[${flex}]`]">
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
    <input
        :type="type"
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3"
        :placeholder="placeholder"
        :maxlength="maxlength"
    />
  </div>
</template>

<style scoped>

</style>