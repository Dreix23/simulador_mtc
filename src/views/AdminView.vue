<script setup>
import { ref } from "vue";
import { UserPlus, FileQuestion, Menu } from "lucide-vue-next";
import UserForm from "@/components/admin/UserForm.vue";
import QuestionnaireForm from "@/components/admin/QuestionnaireForm.vue";

const isSidebarOpen = ref(true);
const activeSection = ref("users");

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const setActiveSection = (section) => {
  activeSection.value = section;
};
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white shadow-md transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div class="p-4 flex justify-between items-center">
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
      <nav class="mt-8">
        <a
          @click="setActiveSection('users')"
          :class="[
            'flex items-center p-4 text-gray-700 hover:bg-red-100 cursor-pointer',
            activeSection === 'users' ? 'bg-red-100' : '',
          ]"
        >
          <UserPlus :size="24" />
          <span :class="['ml-4', isSidebarOpen ? '' : 'hidden']"
            >Agregar Usuarios</span
          >
        </a>
        <a
          @click="setActiveSection('questionnaires')"
          :class="[
            'flex items-center p-4 text-gray-700 hover:bg-red-100 cursor-pointer',
            activeSection === 'questionnaires' ? 'bg-red-100' : '',
          ]"
        >
          <FileQuestion :size="24" />
          <span :class="['ml-4', isSidebarOpen ? '' : 'hidden']"
            >Agregar Cuestionario</span
          >
        </a>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8">
      <UserForm v-if="activeSection === 'users'" />
      <QuestionnaireForm v-else-if="activeSection === 'questionnaires'" />
    </main>
  </div>
</template>

<style scoped>
/* Tailwind CSS */
</style>
