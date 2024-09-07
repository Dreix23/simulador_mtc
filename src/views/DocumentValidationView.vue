<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { IdCard, ChevronDown, Loader2 } from "lucide-vue-next";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Cardsvg from "@/assets/images/card.svg";
import { validacionDocumentoService } from "@/services/validacion_documento_service";
import { logInfo, logError } from "@/utils/logger.js";

const router = useRouter();
const selectedDocumentType = ref("DNI");
const documentTypes = [
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "CARNET DE EXTRANJERIA" },
  { value: "CSR", label: "CARNET DE SOLICITANTE DE REFUGIO" },
  { value: "PTP", label: "PERMISO TEMPORAL DE PERMANENCIA" },
  { value: "CID", label: "CEDULA DE IDENTIDAD DIPLOMATICA" },
];

const documentNumber = ref("");
const isMenuOpen = ref(false);
const isLoading = ref(false);
const isDocumentNotFound = ref(false); 

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    const isValid = await validacionDocumentoService.validarDocumento(
      selectedDocumentType.value,
      documentNumber.value
    );
    if (isValid) {
      const userData = await validacionDocumentoService.obtenerDatosUsuario(
        selectedDocumentType.value,
        documentNumber.value
      );
      if (userData) {
        localStorage.setItem("userData", JSON.stringify(userData));
        logInfo("Documento válido, redirigiendo al perfil");
        router.push({ name: "Profile" });
      } else {
        logInfo("Datos de usuario no encontrados");
        alert("No se pudieron obtener los datos del usuario.");
      }
    } else {
      logInfo("Documento no encontrado en la base de datos");
      isDocumentNotFound.value = true;

    }
  } catch (error) {
    logError(`Error al validar el documento: ${error.message}`);
    alert(
      "Ocurrió un error al validar el documento. Por favor, intente nuevamente."
    );
  } finally {
    isLoading.value = false;
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const selectDocumentType = (type) => {
  selectedDocumentType.value = type.value;
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
    />
    <div class="flex-grow flex flex-col relative">

      <div v-if="isDocumentNotFound" class="flex flex-col items-center pt-[15px] w-full absolute">
        <span class="text-size-14 text-color-red-bg"
          >El postulante no puede dar el examen porque:</span
        >
        <div class="w-full h-[2px] bg-color-gray-line"></div>
        <div
          class="flex items-center gap-[3px] py-[5px] px-[5px] bg-color-yellow mt-[5px] rounded-[2px]"
        >
          <span
            class="icon-[tabler--point-filled] text-size-10 text-color-red-bg"
          ></span>
          <span class="text-size-12 text-color-red-bg"
            >No se encontró el examen activo</span
          >
        </div>
      </div>

      <main class="flex-grow flex flex-col items-center justify-center">
        <div
          class="bg-white w-[375px] shadow-shadow-form items-center rounded-[9px] flex gap-[45px] px-[34px] pt-[56px] pb-[35px]"
        >
          <div class="w-[57px] h-[48px]">
            <img :src="Cardsvg" alt="" class="w-[57px]" />
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
                  {{
                    documentTypes.find(
                      (type) => type.value === selectedDocumentType
                    ).label
                  }}
                  <ChevronDown class="text-gray-500" size="16" />
                </div>

                <div
                  v-if="isMenuOpen"
                  class="absolute w-full bg-white shadow-md mt-1 rounded-md z-10"
                >
                  <ul>
                    <li
                      v-for="type in documentTypes"
                      :key="type.value"
                      @click="selectDocumentType(type)"
                      class="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                    >
                      {{ type.label }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="relative z-0 mb-[14px] w-full">
              <input
                v-model="documentNumber"
                type="text"
                id="floating_standard"
                class="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                placeholder=" "
                required
                autocomplete="off"
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
              :disabled="isLoading"
            >
              <Loader2 v-if="isLoading" class="animate-spin" size="16" />
              <span v-else class="icon-[mdi--key]"></span>
              {{ isLoading ? "Validando..." : "Entrar" }}
            </button>
          </form>
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
/* Añade estilos si es necesario */
</style>
