<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Siren } from "lucide-vue-next";
import MacImg from "@/assets/images/mac.svg";
import { logInfo } from '@/utils/logger.js';

const currentYear = new Date().getFullYear();
const ip = "192.168.140.142";
const mac = "6C-4B-90-B9-B7-2D";

const route = useRoute();
const isRootRoute = ref(route.path === "/");

onMounted(() => {
  isRootRoute.value = route.path === "/";
  logInfo("Footer component mounted");
});
</script>

<template>
  <footer
      class="bg-red-700 text-white px-[10px] text-sm fixed bottom-0 w-full flex justify-between items-center text-size-11 h-[30px] responsive-footer"
  >
    <div class="flex flex-row items-center h-full overflow-hidden">
      <div class="flex items-center gap-[4px] mr-[14px]">
        <span class="icon-[mdi--ip-network] text-[16px]"></span>
        <p class="truncate">{{ ip }}</p>
      </div>
      <div class="flex items-center gap-[4px] border-l-2 pl-[4px] mr-[14px]">
        <img :src="MacImg" alt="">
        <p class="truncate">{{ mac }}</p>
      </div>
      <p class="border-l-2 pl-[4px] text-center capitalize truncate">
        &copy; Desarrollado por la oficina de tecnología de información oGTI -
        ministerio de transporte y comunicaciones - &copy; {{ currentYear }} (v
        1.0.1)
      </p>
    </div>
    <div class="flex flex-row items-center pr-[60px]">
      <div class="border-l-2 pl-[4px] mr-[60px]">
        <Siren class="w-[20px]" />
      </div>
      <div class="border-l-2 border-r-2 pr-[15px] pl-[4px]">
        <span class="truncate">.NET 7.0.0.28</span>
      </div>
      <div
          v-if="isRootRoute"
          class="border-r-2 flex justify-center items-center w-[100px] hover:bg-red-300 hover:text-black"
      >
        <router-link to="/login-admin" class="text-center truncate">Admin</router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@media screen and (max-width: 1599px) {
  .responsive-footer {
    height: 27px; /* Reducción del 10% de 30px */
    padding-top: 4.5px; /* Ajuste para centrar verticalmente el contenido */
    padding-bottom: 4.5px; /* Ajuste para centrar verticalmente el contenido */
    font-size: 12px; /* Reducción del 10% de 13px */
  }

  .responsive-footer .icon-\[mdi--ip-network\] {
    font-size: 15.2px; /* Reducción del 5% de 16px */
  }

  .responsive-footer .w-\[20px\] {
    width: 19px; /* Reducción del 5% de 20px */
    height: 19px; /* Reducción del 5% de 20px */
  }
}
</style>
