<script setup>
import { Trash2, Edit2 } from "lucide-vue-next";
import { logInfo, logError } from "@/utils/logger.js";
import { userService } from "@/services/user_service.js";

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['userDeleted']);

const deleteUser = async (userId) => {
  try {
    await userService.deleteUser(userId);
    emit('userDeleted', userId);
    logInfo(`Usuario eliminado: ${userId}`);
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
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
          <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
        </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in users" :key="user.id">
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.numeroDocumento }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ user.apellidos }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ user.nombre }}</td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.fechaNacimiento }}</td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.categoria }}</td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
            <img v-if="user.imagenUrl" :src="user.imagenUrl" alt="User Image" class="h-8 w-8 rounded-full object-cover" />
            <span v-else>-</span>
          </td>
          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex justify-center space-x-4">
              <button class="text-indigo-600 hover:text-indigo-900">
                <Edit2 class="h-5 w-5" />
              </button>
              <button @click="deleteUser(user.id)" class="text-red-600 hover:text-red-900">
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
