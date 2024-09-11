<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { Loader2 } from "lucide-vue-next";
import { logInfo, logError } from '@/utils/logger.js';
import btnFin from "@/assets/images/btn-fin.svg"
import PerfilImg from "@/assets/images/perfil.png";

const router = useRouter();
const userData = ref(null);
const isLoading = ref(true);

const formattedCategory = computed(() => {
  if (userData.value && userData.value.categoria) {
    const category = userData.value.categoria;
    if (category.length >= 3) {
      const letter = category[0];
      const roman = category.slice(1, -1);
      const lastLetter = category.slice(-1).toLowerCase();
      return `(${letter}) ${roman}${lastLetter}`;
    }
  }
  return userData.value ? userData.value.categoria : 'N/A';
});

onMounted(() => {
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    userData.value = JSON.parse(storedUserData);
    logInfo('Datos del usuario cargados correctamente en ExamFinishedView');
  } else {
    logError('No se encontraron datos del usuario en localStorage en ExamFinishedView');
    router.push('/');
  }
  isLoading.value = false;
});

const startNewExam = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('examData');
  logInfo('Datos del examen y usuario eliminados del localStorage');
  router.push({ name: "validacion-documento" });
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header
        title="EXAMEN FINALIZADO"
        :showMenuIcon="true"
    />

    <main
        class="flex-grow flex flex-col items-center justify-start border-2 my-[10px] mx-[10px] rounded-[5px]"
    >
      <div class="responsive-container">
        <div class="h-[51px] w-full flex justify-center items-center border-b-2">
          <h1 class="text-xl font-medium text-red-600">POSTULANTE</h1>
        </div>
        <div
            class="flex flex-col gap-[28px] items-center w-full h-[244px] p-[28px] border-b-2"
        >
          <img
              :src="userData?.imagenUrl || PerfilImg"
              alt=""
              class="w-[111px] h-[122px] p-[10px] border-[1px] border-color-gray-line rounded-[5px] object-contain"
          />
          <div class="w-full text-center">
            <p class="text-gray-700 font-medium text-size-16 uppercase">
              {{ userData ? `${userData.nombre} ${userData.apellidos}` : 'NOMBRE NO DISPONIBLE' }}
            </p>
            <p class="text-size-14 text-gray-500 uppercase">
              {{ userData ? userData.tipoDocumento : 'DOCUMENTO NO DISPONIBLE' }}
            </p>
          </div>
        </div>
        <div class="h-[68px] w-full flex justify-center items-center border-b-2">
          <h1 class="text-xl font-medium text-red-600">EXAMEN</h1>
        </div>

        <div class="h-[121px] w-full flex flex-col pt-[16px] pb-[23px] justify-between border-b-2">
          <div class="text-gray-700 text-size-14 text-center">
            <p>Categoría: <span class="font-semibold">{{ formattedCategory }}</span></p>
            <p>Idioma: <span class="font-semibold">Español</span></p>
          </div>
          <p class="text-center text-color-gray font-semibold">
            POR FAVOR, ACÉRQUESE PARA LA ENTREGA DE SU RESULTADO
          </p>
        </div>

        <div class="flex justify-center mt-[28px]">
          <button
              type="button"
              @click="startNewExam"
              class="bg-red-700 text-white py-3 px-6 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
          >
            <img :src="btnFin" alt="" class="h-5 w-5 mr-2">
            DAR UN NUEVO EXAMEN
          </button>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
@media screen and (max-width: 1599px) {
  .responsive-container {
    transform: scale(0.9);
    transform-origin: top center;
  }
}
</style>
