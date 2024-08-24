<script setup>
import { defineProps, defineEmits } from "vue";
import { Menu } from "lucide-vue-next";

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

const toggleSidebar = () => {
  emit("toggle-sidebar");
};
</script>

<template>
  <header
      class="bg-red-700 text-white h-[87px] p-[15px] flex items-center justify-between"
  >
    <div class="w-[250px] flex items-center">
      <button v-if="showMenuIcon" @click="toggleSidebar" class="mr-4">
        <Menu class="w-6 h-6" />
      </button>
    </div>
    <h2 class="text-[22px] tracking-[-0.88px] font-normal whitespace-pre-wrap flex-grow text-center">
      {{ title }}
    </h2>
    <div class="h-[54px] w-[250px] flex justify-end">
      <img
          src="@/assets/images/logo-mtc.png"
          alt="MTC Logo"
          class="w-full right-2 py-1 object-contain"
      />
    </div>
  </header>
</template>

<style scoped>
header {
  box-shadow: 0px 4px 11.3px 0px rgba(0, 0, 0, 0.25);
}
</style>
