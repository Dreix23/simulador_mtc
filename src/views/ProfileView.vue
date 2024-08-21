<script setup>
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { UserCircle } from "lucide-vue-next";
import PerfilImg from "@/assets/images/perfil.png";

const router = useRouter();

const startExam = () => {
  router.push({ name: "Home" });
};
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <Header
      title="EXAMEN DE CONOCIMIENTOS"
      :showMenuIcon="false"
      @toggle-sidebar="toggleSidebar"
    />

    <main class="flex-grow flex items-start justify-center p-6">
      <div
        class="bg-white rounded-lg p-8 px-[90px] w-full max-w-md flex flex-col items-center"
      >
        <h1
          class="text-xl font-normal text-red-600 mb-[27px] uppercase w-full text-center pb-[7px] border-b-2"
        >
          Postulante
        </h1>
        <div class="flex flex-col gap-[27px] items-center mb-[40px]">
          <img
            :src="PerfilImg"
            alt=""
            class="w-[126px] h-[126px] p-[5px] border-2 rounded-[5px]"
          />
          <div class="text-center">
            <p class="text-size-20 font-normal text-red-700">45087788</p>
            <p class="text-gray-700 text-size-18">JUAN ISAIAS ROJAS PARIONA</p>
          </div>
        </div>

        <div class="w-full mb-[20px] text-center">
          <h1
            class="text-xl font-normal text-red-600 mb-[15px] uppercase w-full text-center pb-[7px] border-b-2"
          >
            EXAMEN
          </h1>
          <div class="text-gray-700 text-sm">
            <p>Categoría: <span class="font-semibold">A I</span></p>
            <p>Idioma: <span class="font-semibold">Español</span></p>
          </div>
        </div>

        <div class="w-full text-center  mb-[41px]">
          <h4 class="text-color-gray font-normal text-size-20 mb-[10px]">
            Examen de Conocimientos
          </h4>
          <p class="text-size-14 mb-[15px]">
            Tiempo de duración: <span class="font-semibold">40</span> Minutos
          </p>
          <p class="mb-4 text-size-14">
            Porcentaje mínimo: <span class="font-semibold">87</span>%
          </p>
        </div>

        <button
          type="button"
          @click="startExam"
          class="bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-shadow-btn"
        >
          ¡EMPEZAR EXAMEN!
        </button>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Añade estilos si es necesario */
</style>
