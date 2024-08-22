<script setup>
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { UserCircle, RefreshCw } from "lucide-vue-next";
import btnFin from "@/assets/images/btn-fin.svg"

const router = useRouter();

const startNewExam = () => {
  router.push({ name: "/validacion-documento" });
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header
      title="EXAMEN FINALIZADO"
      :showMenuIcon="false"
      @toggle-sidebar="toggleSidebar"
    />

    <main
      class="flex-grow flex flex-col items-center justify-start border-2 my-[10px] mx-[10px] rounded-[5px]"
    >
      <div class="h-[51px] w-full flex justify-center items-center border-b-2">
        <h1 class="text-xl font-medium text-red-600">POSTULANTE</h1>
      </div>
      <div
        class="flex flex-col gap-[28px] items-center w-full h-[244px] p-[28px] border-b-2"
      >
        <UserCircle class="h-[126px] w-[117px] text-gray-500" />
        <div class="w-full text-center">
          <p class="text-gray-700 font-medium text-size-16 uppercase">
            MARCOS GALVIZ MORA
          </p>
          <p class="text-size-14 text-gray-500 uppercase">
            CARNET DE EXTRANJERÍA
          </p>
        </div>
      </div>
      <div class="h-[68px] w-full flex justify-center items-center border-b-2">
        <h1 class="text-xl font-medium text-red-600">EXAMEN</h1>
      </div>

      <div class="h-[121px] w-full flex flex-col pt-[16px] pb-[23px] justify-between  border-b-2">
        <div class="text-gray-700 text-size-14 text-center">
          <p>Categoría: <span class="font-semibold">A I</span></p>
          <p>Idioma: <span class="font-semibold">Español</span></p>
        </div>
        <p class="text-center text-color-gray font-semibold">
          POR FAVOR, ACÉRQUESE PARA LA ENTREGA DE SU RESULTADO
        </p>
      </div>

      <button
        type="button"
        @click="startNewExam"
        class="bg-red-700 text-white py-3 px-6 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center mt-[28px]"
      >
        <!-- <RefreshCw class="h-5 w-5 mr-2" /> -->
         <img :src="btnFin" alt="" class="h-5 w-5 mr-2">
        DAR UN NUEVO EXAMEN
      </button>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
