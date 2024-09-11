<script setup>
import { ref } from "vue";
import { UserPlus, FileQuestion, Menu, LogOut } from "lucide-vue-next";
import User from "@/components/admin/User.vue";
import QuestionnaireList from "@/components/admin/QuestionnaireList.vue";
import QuestionnaireForm from "@/components/admin/questionnaire/QuestionnaireForm.vue";
import Changeipmac from "@/components/admin/Changeipmac.vue";
import { logInfo, logError, logDebug } from "@/utils/logger.js";
import { authService } from "@/services/auth_service";
import { useRouter } from "vue-router";

const router = useRouter();
const isSidebarOpen = ref(true);
const activeSection = ref("users");
const selectedQuestionnaireData = ref([]);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const setActiveSection = (section) => {
  activeSection.value = section;
  selectedQuestionnaireData.value = [];
};

const handleLogout = async () => {
  try {
    await authService.logout();
    await authService.getCurrentUser();
    await router.push({ name: "validacion-documento" });
  } catch (error) {
    logError("Error al cerrar sesión:", error);
    alert(
      "Hubo un problema al cerrar la sesión. Por favor, inténtalo de nuevo."
    );
  }
};

const handleEditQuestionnaire = (questionnaireData) => {
  selectedQuestionnaireData.value = questionnaireData;
  activeSection.value = "editQuestionnaire";
};

const handleQuestionnaireFormClose = () => {
  activeSection.value = "questionnaires";
  selectedQuestionnaireData.value = [];
};

const handleQuestionnaireSave = (savedData) => {
  activeSection.value = "questionnaires";
  selectedQuestionnaireData.value = [];
};
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Barra lateral -->
    <aside
      :class="[
        'bg-white shadow-md transition-all duration-300 ease-in-out fixed h-full flex flex-col justify-between',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div>
        <div
          :class="[
            'p-4 flex items-center',
            isSidebarOpen ? 'justify-between' : 'justify-center',
          ]"
        >
          <h2 :class="['font-bold text-xl', isSidebarOpen ? '' : 'hidden']">
            Panel de Admin
          </h2>
          <button
            @click="toggleSidebar"
            class="text-gray-500 hover:text-gray-700"
          >
            <Menu />
          </button>
        </div>
        <nav
          :class="[
            'mt-8 flex flex-col gap-[8px]',
            isSidebarOpen ? 'px-[16px]' : 'px-[5px]',
          ]"
        >
          <a
            @click="setActiveSection('users')"
            :class="[
              'flex items-center p-4 font-medium cursor-pointer rounded-[8px] border-[1px] border-transparent',
              activeSection === 'users'
                ? 'bg-color-purple-1 border-[1px] border-color-purple-2 text-color-blue-max font-semibold'
                : 'hover:bg-color-purple-1 hover:border-[1px] hover:border-color-purple-2 hover:text-color-blue-max hover:font-semibold',
              isSidebarOpen ? '' : 'justify-center',
            ]"
          >
            <UserPlus :size="24" />
            <span :class="['ml-4', isSidebarOpen ? '' : 'hidden']"
              >Usuarios</span
            >
          </a>
          <!-- Comentado el ítem de cuestionario
        <a
          @click="setActiveSection('questionnaires')"
          :class="[
            'flex items-center p-4 font-medium cursor-pointer rounded-[8px] border-[1px] border-transparent',
            activeSection === 'questionnaires' ||
            activeSection === 'editQuestionnaire'
              ? 'bg-color-purple-1 border-[1px] border-color-purple-2 text-color-blue-max font-semibold'
              : 'hover:bg-color-purple-1 hover:border-[1px] hover:border-color-purple-2 hover:text-color-blue-max hover:font-semibold',
            isSidebarOpen ? '' : 'justify-center',
          ]"
        >
          <FileQuestion :size="24" />
          <span :class="['ml-4', isSidebarOpen ? '' : 'hidden']"
            >Cuestionarios</span
          >
        </a>
        -->
        <a
          @click="setActiveSection('changeipmac')"
          :class="[
            'flex items-center p-4 font-medium cursor-pointer rounded-[8px] border-[1px] border-transparent',
            activeSection === 'changeipmac' ||
            activeSection === 'editQuestionnaire'
              ? 'bg-color-purple-1 border-[1px] border-color-purple-2 text-color-blue-max font-semibold'
              : 'hover:bg-color-purple-1 hover:border-[1px] hover:border-color-purple-2 hover:text-color-blue-max hover:font-semibold',
            isSidebarOpen ? '' : 'justify-center',
          ]"
        >
          <span class="icon-[mdi--ip-network-outline] text-[24px]"></span>
          <span :class="['ml-4', isSidebarOpen ? '' : 'hidden']"
            >Ip - Mac</span
          >
        </a>
      </nav>
    </div>

    <!-- Botón de cerrar sesión -->
      <div class="mb-4 px-4">
        <button
            @click="handleLogout"
            class="relative flex items-center p-2.5 font-medium cursor-pointer rounded-[8px] border-[1px] border-transparent w-full bg-red-500 text-white hover:bg-red-600"
        >
          <LogOut :size="30" class="z-10"/>
          <span
              class="absolute inset-0 flex items-center justify-center w-full"
              :class="[isSidebarOpen ? '' : 'hidden']"
          >
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main
      :class="['flex-1 p-8 overflow-y-auto', isSidebarOpen ? 'ml-64' : 'ml-20']"
    >
      <User v-if="activeSection === 'users'" />
      <QuestionnaireList
        v-if="activeSection === 'questionnaires'"
        @edit-questionnaire="handleEditQuestionnaire"
      />
      <Changeipmac v-if="activeSection === 'changeipmac'" />
      <QuestionnaireForm
        v-if="activeSection === 'editQuestionnaire'"
        :editData="selectedQuestionnaireData"
        @close="handleQuestionnaireFormClose"
        @save="handleQuestionnaireSave"
      />
    </main>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
