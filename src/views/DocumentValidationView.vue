<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { IdCard, Hash } from 'lucide-vue-next';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const router = useRouter();

const selectedDocumentType = ref('DNI');
const documentTypes = [
  'DNI',
  'CARNET DE EXTRANJERIA',
  'CARNET DE SOLICITANTE DE REFUGIO',
  'PERMISO TEMPORAL DE PERMANENCIA',
  'CEDULA DE IDENTIDAD DIPLOMATICA'
];

const documentNumber = ref('');
const isMenuOpen = ref(false);

const handleSubmit = () => {
  console.log('Form submitted');
  router.push({name: 'Profile'});
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const selectDocumentType = (type) => {
  selectedDocumentType.value = type;
  isMenuOpen.value = false;
};

const closeMenuOnClickOutside = (event) => {
  if (isMenuOpen.value && !event.target.closest('.document-type-dropdown')) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnClickOutside);
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <Header title="EXAMEN DE CONOCIMIENTO - ACCESO PARA POSTULANTES" :showMenuIcon="false"
            @toggle-sidebar="toggleSidebar"/>

    <main class="flex-grow flex items-center justify-center p-6">
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-lg flex">
        <div class="flex items-center justify-center mr-6">
          <div class="bg-red-100 p-4 rounded-full">
            <IdCard class="h-16 w-16 text-red-700"/>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="flex-grow">
          <div class="mb-4 relative document-type-dropdown w-full">
            <label for="documentType" class="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
            <div class="relative">
              <button
                  @click="toggleMenu"
                  type="button"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-left bg-white"
                  aria-haspopup="listbox"
                  :aria-expanded="isMenuOpen"
              >
                {{ selectedDocumentType }}
              </button>
              <IdCard class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>

              <div
                  v-if="isMenuOpen"
                  class="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
                  role="listbox"
              >
                <ul class="py-1">
                  <li
                      v-for="type in documentTypes"
                      :key="type"
                      @click="selectDocumentType(type)"
                      class="px-3 py-2 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                      role="option"
                  >
                    {{ type }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="mb-6 w-full">
            <label for="documentNumber" class="block text-sm font-medium text-gray-700 mb-1">N° de documento</label>
            <div class="relative">
              <input
                  id="documentNumber"
                  v-model="documentNumber"
                  type="text"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
              <Hash class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
            </div>
          </div>

          <button
              type="submit"
              class="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>

    <Footer/>
  </div>
</template>

<style scoped>
/* Añade estilos si es necesario */
</style>
