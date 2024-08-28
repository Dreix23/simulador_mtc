<script setup>
import { ref } from "vue";
import { UserPlus, FileQuestion, Menu } from "lucide-vue-next";
import User from "@/components/admin/User.vue";
import QuestionnaireList from "@/components/admin/QuestionnaireList.vue";
import QuestionnaireForm from "@/components/admin/questionnaire/QuestionnaireForm.vue";

const isSidebarOpen = ref(true);
const activeSection = ref("users");
const editingQuestionnaireId = ref(null);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const setActiveSection = (section) => {
  activeSection.value = section;
  editingQuestionnaireId.value = null;
};

const handleEditQuestionnaire = (id) => {
  editingQuestionnaireId.value = id;
  activeSection.value = "editQuestionnaire";
};

const handleQuestionnaireFormClose = () => {
  activeSection.value = "questionnaires";
  editingQuestionnaireId.value = null;
};
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white shadow-md transition-all duration-300 ease-in-out fixed h-full',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div
        :class="[
          'p-4 flex  items-center',
          isSidebarOpen ? 'justify-between' : 'justify-center',
        ]"
      >
        <h2 :class="['font-bold text-xl', isSidebarOpen ? '' : 'hidden']">
          Admin Panel
        </h2>
        <button
          @click="toggleSidebar"
          class="text-gray-500 hover:text-gray-700"
        >
          <Menu />
        </button>
      </div>
      <nav :class="['mt-8 flex flex-col gap-[8px]', isSidebarOpen ? ' px-[16px]' : 'px-[5px]',]">
        <a
          @click="setActiveSection('users')"
          :class="[
            'flex items-center p-4 font-medium cursor-pointer rounded-[8px] border-[1px] border-transparent ',
            activeSection === 'users' ? 'bg-color-purple-1 border-[1px] border-color-purple-2 text-color-blue-max font-semibold ' : 'hover:bg-color-purple-1 hover:border-[1px] hover:border-color-purple-2 hover:text-color-blue-max hover:font-semibold ',  isSidebarOpen ? '' : 'justify-center'
          ]"
        >
          <UserPlus :size="24" />
          <span :class="['ml-4', isSidebarOpen ? '' : 'hidden']"
            >Usuarios</span
          >
        </a>
        <a
          @click="setActiveSection('questionnaires')"
          :class="[
            'flex items-center p-4 font-medium cursor-pointer rounded-[8px] border-[1px] border-transparent',
            activeSection === 'questionnaires' ||
            activeSection === 'editQuestionnaire'
              ? 'bg-color-purple-1 border-[1px] border-color-purple-2 text-color-blue-max font-semibold'
              : 'hover:bg-color-purple-1 hover:border-[1px] hover:border-color-purple-2 hover:text-color-blue-max hover:font-semibold',  isSidebarOpen ? '' : 'justify-center'
          ]"
        >
          <FileQuestion :size="24" />
          <span :class="['ml-4', isSidebarOpen ? '' : 'hidden']"
            >Cuestionarios</span
          >
        </a>
      </nav>
    </aside>

    <!-- Main content -->
    <main
      :class="['flex-1 p-8 overflow-y-auto', isSidebarOpen ? 'ml-64' : 'ml-20']"
    >
      <User v-if="activeSection === 'users'" />
      <QuestionnaireList
        v-if="activeSection === 'questionnaires'"
        @edit-questionnaire="handleEditQuestionnaire"
      />
      <QuestionnaireForm
        v-if="activeSection === 'editQuestionnaire'"
        :questionnaireId="editingQuestionnaireId"
        @close="handleQuestionnaireFormClose"
      />
    </main>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
