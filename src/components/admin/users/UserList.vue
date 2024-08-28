<script setup>
import { Trash2, Edit2 } from "lucide-vue-next";
import { logInfo, logError } from "@/utils/logger.js";

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['delete-user']);

const deleteUser = async (index) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const deletedUser = props.users[index];
    emit('delete-user', index);
    logInfo(`Usuario eliminado: ${deletedUser.nombre} ${deletedUser.apellidos}`);
  } catch (error) {
    logError(`Error al eliminar usuario: ${error.message}`);
  }
};
</script>

<template>
  <div class="mt-10">
    <h3 class="text-xl font-semibold mb-4">Lista de Usuarios</h3>
    <div class="overflow-x-auto bg-gray-100 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
        <tr>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">DNI</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Apellidos</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Nombre</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">F. Nac.</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Cat.</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Imagen</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Acciones</th>
        </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="(user, index) in users" :key="user.dni">
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.dni }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ user.apellidos }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ user.nombre }}</td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.fechaNacimiento }}</td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.categoria }}</td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
            <img
                v-if="user.imagenUrl"
                :src="user.imagenUrl"
                alt="User Image"
                class="h-8 w-8 rounded-full object-cover"
            />
            <span v-else>-</span>
          </td>
          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button class="text-indigo-600 hover:text-indigo-900">
                <Edit2 class="h-5 w-5" />
              </button>
              <button @click="deleteUser(index)" class="text-red-600 hover:text-red-900">
                <Trash2 class="h-5 w-5" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
</style>
