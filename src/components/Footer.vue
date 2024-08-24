<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Siren } from "lucide-vue-next";
import MacImg from "@/assets/images/mac.svg";

const currentYear = new Date().getFullYear();
const ip = "192.168.140.142";
const mac = "6C-4B-90-B9-B7-2D";

// Usar useRoute para obtener la ruta actual
const route = useRoute();
const isRootRoute = ref(route.path === "/");

// Reaccionar a los cambios en la ruta
onMounted(() => {
  isRootRoute.value = route.path === "/";
});
</script>

<template>
  <footer
    class="bg-red-700 text-white px-[10px] text-sm fixed bottom-0 w-full flex justify-between items-center text-size-11 h-[30px]"
  >
    <div class="flex flex-row items-center h-full">
      <div class="flex items-center gap-[4px] mr-[14px]">
        <span class="icon-[mdi--ip-network] text-[16px]"></span>
        <p>{{ ip }}</p>
      </div>
      <div class="flex items-center gap-[4px] border-l-2 pl-[4px] mr-[14px]">
        <img :src="MacImg" alt="">
        <p>{{ mac }}</p>
      </div>
      <p class="border-l-2 pl-[4px] text-center capitalize">
        &copy Desarrollado por la oficina de tecnología de información oGTI -
        ministerio de transporte y comunicaciones - &copy {{ currentYear }} (v
        1.0.1)
      </p>
    </div>
    <div class="flex flex-row items-center pr-[60px]">
      <div class="border-l-2 pl-[4px] mr-[60px]">
        <Siren class="w-[20px]" />
      </div>
      <div class="border-l-2 border-r-2 pr-[15px] pl-[4px]">
        <span>.NET 7.0.0.28</span>
      </div>
      <!-- Mostrar el botón de admin solo si estamos en la ruta raíz -->
      <div
        v-if="isRootRoute"
        class="border-r-2 flex justify-center items-center w-[100px] hover:bg-red-300 hover:text-black"
      >
        <router-link to="/login-admin" class="text-center">Admin</router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
