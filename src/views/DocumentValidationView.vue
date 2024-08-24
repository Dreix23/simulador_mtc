<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { IdCard, ChevronDown } from "lucide-vue-next";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Keysvg from "@/assets/images/key.svg";
import Cardsvg from "@/assets/images/card.svg";

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

    <main class="flex-grow flex items-center justify-center ">
      <div
          class="bg-white w-[375px] shadow-shadow-form items-center rounded-[9px] flex gap-[45px]  px-[34px] pt-[56px] pb-[35px]"
      >
        <div class="w-[57px] h-[48px]">
          <img :src="Cardsvg" alt="" class="w-[57px]"/>
        </div>

        <form
            @submit.prevent="handleSubmit"
            class="flex flex-col items-center w-full"
        >
          <div class="mb-[33px] relative document-type-dropdown w-full">
            <label for="underline_select" class="sr-only text-black">
              Selecciona un tipo de documento
            </label>
            <div class="relative">
              <div
                  class="cursor-pointer py-2.5 w-full text-sm text-black bg-transparent border-b-2 border-gray-200 flex items-center justify-between"
                  @click="toggleMenu"
              >
                {{ selectedDocumentType }}
                <ChevronDown
                    class="text-gray-500"
                    size="16"
                />
              </div>

              <!-- Dropdown menu -->
              <div
                  v-if="isMenuOpen"
                  class="absolute w-full bg-white shadow-md mt-1 rounded-md z-10"
              >
                <ul>
                  <li
                      v-for="type in documentTypes"
                      :key="type"
                      @click="selectDocumentType(type)"
                      class="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                  >
                    {{ type }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="relative z-0 mb-[14px] w-full">
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
              class="flex items-center justify-center gap-1 md:gap-2 w-[122px] shadow-shadow-btn text-[14px] bg-red-700 text-white py-[7px] rounded-[4px] hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span class="icon-[mdi--key]"></span>
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
