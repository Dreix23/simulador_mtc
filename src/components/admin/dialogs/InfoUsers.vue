<script setup>
import { X } from "lucide-vue-next";
import { ref } from "vue";
import PerfilImg from "@/assets/images/perfil.png";

// Define un estado interno para controlar la visibilidad del modal
const isVisible = ref(false);
const totalattempts = 10;

// Función para abrir el modal
function openModal() {
  isVisible.value = true;
}

// Función para cerrar el modal
function closeModal() {
  isVisible.value = false;
}

// Emite eventos para cerrar el modal desde otros componentes
defineExpose({
  openModal,
  closeModal,
});

const calificaciones = ref([
  { intento: 1, calificacion: 15 },
  { intento: 2, calificacion: 18 },
  { intento: 3, calificacion: 20 },
  { intento: 3, calificacion: 20 },
  { intento: 3, calificacion: 20 },
  { intento: 3, calificacion: 20 },
  { intento: 3, calificacion: 20 },
  { intento: 3, calificacion: 20 },
  { intento: 3, calificacion: 20 },
  { intento: 3, calificacion: 20 },
  // Añade más objetos según sea necesario
]);
</script>

<template>
  <div
    v-if="isVisible"
    id="crypto-modal"
    tabindex="-1"
    aria-hidden="true"
    class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-start p-[30px] h-[100vh] w-full"
    @click="closeModal"
  >
    <div class="relative p-4 w-full max-w-[800px] container-popup" @click.stop>
      <!-- Modal content -->
      <div
        class="relative flex flex-col bg-white rounded-lg shadow-shadow-form h-full"
      >
        <!-- Modal header -->
        <div class="border-b-[2px] border-color-gray-line relative p-[20px]">
          <div class="absolute right-[10px] top-[10px]">
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center transition-colors duration-300 ease-in-out"
              @click="closeModal"
            >
              <X />
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <div class="flex flex-col items-center pb-[10px]">
            <img
              class="w-24 h-24 mb-3 rounded-full shadow-lg"
              :src="PerfilImg"
              alt="Bonnie image"
            />
            <h5 class="mb-1 text-size-20 font-medium text-color-blue-max">
              José Jarlin Chiquin Guevara
            </h5>
            <div class="flex gap-[40px]">
              <span class="text-sm text-gray-500">DNI: 88888888</span>
              <span class="text-sm text-gray-500">Categoría: BIIC</span>
            </div>
          </div>
        </div>
        <!-- Modal body -->
        <div
          class="p-4 h-full flex flex-col gap-[20px] items-center overflow-y-auto max-h-full"
        >
          <h3 class="text-size-16 text-center">
            Total de intentos:
            <span class="text-size-18 font-semibold text-color-blue-max"
              >{{ totalattempts }}
            </span>
          </h3>
          <table
            class="w-[350px] text-center bg-white border border-gray-200 rounded-lg shadow-md"
          >
            <thead class="bg-gray-200">
              <tr>
                <th class="px-4 py-2 text-center text-gray-600 font-semibold">
                  Intentos
                </th>
                <th class="px-4 py-2 text-center text-gray-600 font-semibold">
                  Calificación
                </th>
              </tr>
            </thead>
            <tbody class="">
              <tr
                v-for="(item, index) in calificaciones"
                :key="index"
                class="border-t border-gray-200 hover:bg-gray-100"
              >
                <td class="px-4 py-2 text-gray-700">{{ item.intento }}</td>
                <td class="px-4 py-2 text-gray-700">{{ item.calificacion }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}
.container-popup {
  height: calc(100vh - 70px);
}
</style>
