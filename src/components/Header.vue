<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref } from "vue";
import { defineProps, defineEmits } from "vue";
import { Menu } from "lucide-vue-next";
import Sidebar from "./home/NabBar.vue";
import { logInfo, logDebug } from "@/utils/logger.js";

const router = useRouter()
const route = useRoute()

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
const clickCount = ref(0);

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
  emit("toggle-sidebar");
  logInfo("Sidebar toggled");
};

function handleAdminClick() {
  if (route.path === '/') {
    clickCount.value++;
    logDebug(`Click count: ${clickCount.value}`);
    if (clickCount.value === 3) {
      router.push("/login-admin");
      clickCount.value = 0;
    }
  } else {
    logInfo("Solo puedes acceder al admin en la ruta raíz");
  }
}
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
    <div class="h-[87px] w-[250px] flex justify-end items-center">
      <div class="relative">
        <img
            src="@/assets/images/logo-mtc.png"
            alt="MTC Logo"
            class="w-full py-1 object-contain responsive-logo"
        />
        <div
            @click="handleAdminClick"
            class="absolute inset-y-0 left-1/4 w-1/5"
        ></div>
      </div>
    </div>
  </header>

  <Sidebar :isVisible="isSidebarVisible" @close="isSidebarVisible = false"/>
</template>

<style scoped>
header {
  box-shadow: 0px 4px 11.3px 0px rgba(0, 0, 0, 0.25);
}

@media screen and (max-width: 1800px) {
  .responsive-header {
    height: 78px;
    padding-top: 13.5px;
    padding-bottom: 13.5px;
  }

  .responsive-title {
    font-size: 19.8px;
  }

  .responsive-logo {
    height: 48.6px;
  }

  .responsive-icon {
    width: 27px;
    height: 27px;
  }
}
</style>
