<script setup>
import { ref } from 'vue';
import { UserPlus, Loader2, Trash2, Image, Edit2 } from 'lucide-vue-next';
import { logInfo, logError } from '@/utils/logger.js';

const users = ref([]);
const newUser = ref({
  dni: '',
  apellidos: '',
  nombre: '',
  fechaNacimiento: '',
  categoria: 'A',
  imagen: null
});
const isLoading = ref(false);

const addUser = async () => {
  if (!newUser.value.dni || !newUser.value.apellidos || !newUser.value.nombre) return;
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    users.value.push({ ...newUser.value });
    logInfo(`Usuario añadido: ${newUser.value.nombre} ${newUser.value.apellidos}`);
    newUser.value = { dni: '', apellidos: '', nombre: '', fechaNacimiento: '', categoria: 'A', imagen: null };
  } catch (error) {
    logError(`Error al añadir usuario: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const deleteUser = async (index) => {
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const deletedUser = users.value.splice(index, 1)[0];
    logInfo(`Usuario eliminado: ${deletedUser.nombre} ${deletedUser.apellidos}`);
  } catch (error) {
    logError(`Error al eliminar usuario: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newUser.value.imagen = file;
  }
};
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Formulario de Usuario</h2>
    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-2">
        <label for="dni" class="block text-sm font-medium text-gray-700 mb-2">DNI</label>
        <input
            type="text"
            id="dni"
            v-model="newUser.dni"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3"
            placeholder="DNI"
            maxlength="10"
        />
      </div>
      <div class="col-span-3">
        <label for="apellidos" class="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
        <input
            type="text"
            id="apellidos"
            v-model="newUser.apellidos"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3"
            placeholder="Apellidos"
        />
      </div>
      <div class="col-span-3">
        <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
        <input
            type="text"
            id="nombre"
            v-model="newUser.nombre"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3"
            placeholder="Nombre"
        />
      </div>
      <div class="col-span-2">
        <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700 mb-2">F. Nacimiento</label>
        <input
            type="date"
            id="fechaNacimiento"
            v-model="newUser.fechaNacimiento"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3"
        />
      </div>
      <div class="col-span-2">
        <label for="categoria" class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <select
            id="categoria"
            v-model="newUser.categoria"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
      <div class="col-span-6 flex items-end space-x-4">
        <div class="w-40">
          <input
              type="file"
              id="imagen"
              @change="handleImageUpload"
              accept="image/*"
              class="sr-only"
          />
          <label for="imagen" class="cursor-pointer bg-white py-2 px-3 border-2 border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-12 flex items-center justify-center w-full">
            <Image class="h-5 w-5 mr-2" />
            <span class="truncate">{{ newUser.imagen ? newUser.imagen.name : 'Imagen' }}</span>
          </label>
        </div>
        <button
            @click="addUser"
            :disabled="isLoading || !newUser.dni || !newUser.apellidos || !newUser.nombre"
            class="w-40 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-12"
        >
          <Loader2 v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          <UserPlus v-else class="-ml-1 mr-3 h-5 w-5" />
          Guardar
        </button>
      </div>
    </div>

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
              <img v-if="user.imagen" :src="URL.createObjectURL(user.imagen)" alt="User Image" class="h-8 w-8 rounded-full object-cover" />
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
  </div>
</template>

<style scoped>
</style>
