<script setup>
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { UserCircle } from 'lucide-vue-next';

const router = useRouter();

const startExam = () => {
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <Header title="EXAMEN DE CONOCIMIENTOS" :showMenuIcon="false" @toggle-sidebar="toggleSidebar"/>

    <main class="flex-grow flex items-center justify-center p-6">
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col items-center">
        <h1 class="text-xl font-bold text-red-600 mb-4">Postulante</h1>
        <div class="flex flex-col items-center mb-6">
          <UserCircle class="h-24 w-24 text-gray-500 mb-4" />
          <p class="text-lg font-semibold text-red-700">45087788</p>
          <p class="text-gray-700">JUAN ISAIAS ROJAS PARIONA</p>
        </div>

        <div class="w-full mb-6 text-center">
          <h1 class="text-red-700 text-base font-semibold mb-2">EXAMEN</h1>
          <hr class="border-t border-gray-300 my-2">
          <div class="text-gray-700 text-sm">
            <p>Categoría: <span class="font-semibold">A I</span></p>
            <p>Idioma: <span class="font-semibold">Español</span></p>
          </div>
        </div>

        <div class="w-full text-center">
          <h4 class="text-red-700 font-semibold">Examen de Conocimientos</h4>
          <p>Tiempo de duración: 40 Minutos</p>
          <p class="mb-4">Porcentaje mínimo: 87%</p>
        </div>

        <hr class="border-t border-gray-300 w-full mb-6">

        <button
            type="button"
            @click="startExam"
            class="bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
