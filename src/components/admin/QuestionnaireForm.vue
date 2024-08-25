<script setup>
import { ref } from 'vue';
import { FileQuestion, Loader2 } from 'lucide-vue-next';
import { logInfo, logError } from '@/utils/logger.js';

const newQuestionnaire = ref('');
const isLoading = ref(false);

const addQuestionnaire = async () => {
  if (!newQuestionnaire.value) return;
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    logInfo(`Questionnaire added: ${newQuestionnaire.value}`);
    newQuestionnaire.value = '';
  } catch (error) {
    logError(`Error adding questionnaire: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Questionnaire Form</h2>
    <div class="mb-4">
      <label for="newQuestionnaire" class="block text-sm font-medium text-gray-700 mb-2">New Questionnaire</label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FileQuestion class="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            id="newQuestionnaire"
            v-model="newQuestionnaire"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Questionnaire name"
        />
      </div>
    </div>
    <button
        @click="addQuestionnaire"
        :disabled="isLoading || !newQuestionnaire"
        class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Loader2 v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
      Add Questionnaire
    </button>
  </div>
</template>

<style scoped>
</style>