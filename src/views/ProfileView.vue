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
  <div class="min-h-screen h-screen bg-white flex flex-col">
    <Header
      title="EXAMEN DE CONOCIMIENTOS"
      :showMenuIcon="false"
      @toggle-sidebar="toggleSidebar"
    />

    <main
      class="bg-white flex-grow flex items-start justify-center mt-[21px] overflow-auto border-t-[1px] border-color-gray-line"
    >
      <div
        class="bg-white rounded-lg px-[90px] w-full max-w-md flex flex-col items-center mt-[49px]"
      >
        <h1
          class="text-[20px] font-normal text-color-red uppercase w-full text-center pb-[12px] border-b-[1px] border-color-gray-line"
        >
          Postulante
        </h1>

        <div class="flex flex-col gap-[22px] items-center mb-[43px] mt-[22px]">
          <img
            :src="PerfilImg"
            alt=""
            class="w-[111px] h-[122px] p-[10px] border-[1px] border-color-gray-line rounded-[5px]"
          />
          <div class="text-center flex flex-col gap-[2px]">
            <p class="text-size-20 font-normal text-black">45087788</p>
            <p class="text-color-gray text-size-12">
              JUAN ISAIAS ROJAS PARIONA
            </p>
          </div>
        </div>

        <h1
          class="text-[20px] font-normal text-color-red uppercase w-full text-center pb-[9px] border-b-[1px] border-color-gray-line"
        >
          EXAMEN
        </h1>

        <div class="flex flex-col items-center gap-[18px] mt-[14px] mb-[23px]">
          <div class="flex flex-col gap-[12px] text-size-12 items-center">
            <p>Categoría: <span class="font-semibold">A I</span></p>
            <p>Idioma: <span class="font-semibold">Español</span></p>
          </div>
          <h4 class="text-color-gray font-normal text-size-20">
            Examen de Conocimientos
          </h4>
          <div class="flex flex-col gap-[12px] text-size-12 items-center">
            <p class="">
              Tiempo de duración: <span class="font-semibold">40</span> Minutos
            </p>
            <p class="">
              Porcentaje mínimo: <span class="font-semibold">87</span>%
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="startExam"
          class="flex items-center justify-center gap-[5px] w-[190px] shadow-shadow-btn text-[14px] bg-red-700 text-white py-[7px] rounded-[4px] hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <span class="icon-[mdi--clock-start] text-[15px]"></span>
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
