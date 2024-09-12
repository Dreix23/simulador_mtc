<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { Loader2 } from "lucide-vue-next";
import PerfilImg from "@/assets/images/perfil.png";
import { logInfo, logError } from '@/utils/logger.js';
import { formatCategory } from '@/utils/category_formatter';

const router = useRouter();
const userData = ref(null);
const isLoading = ref(true);

const formattedCategory = computed(() => {
  if (userData.value && userData.value.categoria) {
    return formatCategory(userData.value.categoria);
  }
  return userData.value ? userData.value.categoria : '';
});

onMounted(() => {
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    userData.value = JSON.parse(storedUserData);
    logInfo('Datos del usuario cargados correctamente');
  } else {
    logError('No se encontraron datos del usuario en localStorage');
    router.push('/');
  }
  isLoading.value = false;
});

const startExam = () => {
  router.push({name: "Home"});
};
</script>

<template>
  <div class="min-h-screen h-screen bg-white flex flex-col">
    <Header
        title="EXAMEN DE CONOCIMIENTOS"
        :showMenuIcon="true"
    />

    <main
        class="bg-white flex-grow flex items-start justify-center mt-[21px] overflow-auto border-t-[1px] border-color-gray-line"
    >
      <div class="responsive-container">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <Loader2 class="animate-spin" size="48"/>
        </div>

        <div
            v-else-if="userData"
            class="bg-white rounded-lg px-[90px] w-full max-w-md flex flex-col items-center mt-[49px]"
        >
          <h1
              class="text-[20px] font-normal text-color-red uppercase w-full text-center pb-[12px] border-b-[1px] border-color-gray-line"
          >
            Postulante
          </h1>

          <div class="flex flex-col gap-[22px] items-center mb-[43px] mt-[22px]">
            <img
                :src="userData.imagenUrl || PerfilImg"
                alt=""
                class="w-[111px] h-[122px] p-[10px] border-[1px] border-color-gray-line rounded-[5px] object-contain"
            />
            <div class="text-center flex flex-col gap-[2px]">
              <p class="text-size-20 font-normal text-black">{{ userData.numeroDocumento }}</p>
              <p class="text-color-gray text-size-12">
                {{ userData.nombre }} {{ userData.apellidos }}
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
              <p>Categoría: <span class="font-semibold">{{ formattedCategory }}</span></p>
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
      </div>
    </main>

    <Footer/>
  </div>
</template>

<style scoped>
@media screen and (max-width: 1800px) {
  .responsive-container {
    transform: scale(0.9);
    transform-origin: top center;
  }
}
</style>
