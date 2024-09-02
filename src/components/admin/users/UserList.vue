<script setup>
import { ref } from "vue";
import { Trash2, Edit2, Search } from "lucide-vue-next";
import { logInfo, logError } from "@/utils/logger.js";
import { userService } from "@/services/user_service.js";
import InfoUsers from "../dialogs/InfoUsers.vue";

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["userDeleted", "editUser"]);
const expiredUsers = 10;

const deleteUser = async (userId) => {
  try {
    await userService.deleteUser(userId);
    emit("userDeleted", userId);
    logInfo(`Usuario eliminado: ${userId}`);
  } catch (error) {
    logError(`Error al eliminar usuario: ${error.message}`);
  }
};

const editUser = (user) => {
  emit("editUser", user);
};
const infoUsersRef = ref(null);

function showModal() {
  infoUsersRef.value.openModal();
}
</script>

<template>
  <div class="mt-10">
    <div class="flex justify-between items-center mb-[20px]">
      <h3 class="text-xl font-semibold">Lista de Usuarios</h3>
      <div>
        <form class="max-w-md mx-auto">
          <label
            for="default-search"
            class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >Search</label
          >
          <div class="relative">
            <div
              class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            >
              <Search class="text-color-gray" />
            </div>
            <input
              type="search"
              id="default-search"
              class="block w-full p-[10px] ps-10 text-size-14 outline-none min-w-[400px] border-[2px] rounded-md border-color-gray-line focus:border-color-blue-max"
              placeholder="Buscar usuario por Nombre, apellido o DNI"
              required
            />
          </div>
        </form>
      </div>

      <div>
        <button
          class="border-[2px] border-color-red py-[10px] px-[15px] rounded-md text-size-14 hover:bg-color-red hover:text-white transition-colors duration-300 ease-in-out"
        >
          Eliminar {{ expiredUsers }} usuarios
        </button>
      </div>
    </div>

    <div class="overflow-x-auto bg-gray-100 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Documento
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Apellidos
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nombre
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Fecha de Nacimiento
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Categoría
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Imagen
            </th>
            <th
              class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="user in users"
            :key="user.id"
            @click="showModal"
            class="cursor-pointer"
          >
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.numeroDocumento }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium"
            >
              {{ user.apellidos }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium"
            >
              {{ user.nombre }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.fechaNacimiento }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.categoria }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              <img
                v-if="user.imagenUrl"
                :src="user.imagenUrl"
                alt="User Image"
                class="h-8 w-8 rounded-full object-cover"
              />
              <span v-else>-</span>
            </td>
            <td
              class="px-3 py-4 whitespace-nowrap text-sm font-medium"
              @click.stop
            >
              <div class="flex justify-center space-x-4">
                <button
                  @click="editUser(user)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit2 class="h-5 w-5" />
                </button>
                <button
                  @click="deleteUser(user.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  <Trash2 class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoUsers ref="infoUsersRef" />
</template>

<style scoped></style>
