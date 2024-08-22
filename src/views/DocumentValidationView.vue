<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { IdCard, ChevronDown } from "lucide-vue-next";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Keysvg from "@/assets/images/key.svg";

const router = useRouter();

const selectedDocumentType = ref("DNI");
const documentTypes = [
  "DNI",
  "CARNET DE EXTRANJERIA",
  "CARNET DE SOLICITANTE DE REFUGIO",
  "PERMISO TEMPORAL DE PERMANENCIA",
  "CEDULA DE IDENTIDAD DIPLOMATICA",
];

const documentNumber = ref("");
const isMenuOpen = ref(false);

const handleSubmit = () => {
  console.log("Form submitted");
  router.push({ name: "Profile" });
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const selectDocumentType = (type) => {
  selectedDocumentType.value = type;
  isMenuOpen.value = false;
};

const closeMenuOnClickOutside = (event) => {
  if (isMenuOpen.value && !event.target.closest(".document-type-dropdown")) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenuOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", closeMenuOnClickOutside);
});
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <Header
      title="EXAMEN DE CONOCIMIENTO - ACCESO PARA POSTULANTES"
      :showMenuIcon="false"
      @toggle-sidebar="toggleSidebar"
    />

    <main class="flex-grow flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div class="bg-white rounded-lg shadow-shadow-form p-6 md:p-8 lg:p-10 w-full flex flex-col md:flex-row max-w-sm md:max-w-md lg:max-w-lg">
        <div class="flex items-center justify-center mb-6 md:mb-0 md:mr-6">
          <div class="bg-red-100 p-4 rounded-full">
            <IdCard class="h-16 w-16 text-red-700" />
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="flex-grow">
          <div class="mb-6 relative document-type-dropdown w-full">
            <label for="underline_select" class="sr-only text-black">
              Selecciona un tipo de documento
            </label>
            <div class="relative">
              <select
                id="underline_select"
                v-model="selectedDocumentType"
                class="block py-2.5 cursor-pointer w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-200 peer pr-10"
              >
                <option v-for="type in documentTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
              <ChevronDown
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                size="16"
              />
            </div>
          </div>

          <div class="relative z-0 mb-6">
            <input
              type="text"
              id="floating_standard"
              class="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
              placeholder=" "
            />
            <label
              for="floating_standard"
              class="absolute text-sm text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-black peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:start-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >
              N° de documento
            </label>
          </div>

          <button
            type="submit"
            class="flex items-center justify-center gap-1 md:gap-2 w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <img :src="Keysvg" />
            Entrar
          </button>
        </form>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Añade estilos si es necesario */
</style>
