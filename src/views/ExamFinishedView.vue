<script setup>
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { UserCircle, RefreshCw } from 'lucide-vue-next';

const router = useRouter();

const startNewExam = () => {
  router.push({ name: 'DocumentValidation' });
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <Header title="EXAMEN FINALIZADO" :showMenuIcon="false" @toggle-sidebar="toggleSidebar"/>

    <main class="flex-grow flex items-center justify-center p-6">
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col items-center">
        <h1 class="text-xl font-bold text-red-600 mb-4">POSTULANTE</h1>
        <div class="flex flex-col items-center mb-6">
          <UserCircle class="h-24 w-24 text-gray-500 mb-4" />
          <p class="text-gray-700">MARCOS GALVIZ MORA</p>
          <p class="text-sm text-gray-500">CARNET DE EXTRANJERÍA</p>
        </div>

        <div class="w-full mb-6 text-center">
          <h1 class="text-red-700 text-base font-semibold mb-2">EXAMEN</h1>
          <hr class="border-t border-gray-300 my-2">
          <div class="text-gray-700 text-sm">
            <p>Categoría: <span class="font-semibold">A I</span></p>
            <p>Idioma: <span class="font-semibold">Español</span></p>
          </div>
        </div>

        <p class="text-center text-red-700 font-semibold mb-2">
          POR FAVOR, ACÉRQUESE PARA LA ENTREGA DE SU RESULTADO
        </p>

        <button
            type="button"
            @click="startNewExam"
            class="bg-red-700 text-white py-3 px-6 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center mt-6"
        >
          <RefreshCw class="h-5 w-5 mr-2" />
          DAR UN NUEVO EXAMEN
        </button>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
