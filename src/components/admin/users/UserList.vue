<script setup>
import {ref, computed, onMounted} from "vue";
import {Trash2, Edit2, Search} from "lucide-vue-next";
import {logInfo, logError} from "@/utils/logger.js";
import {userService} from "@/services/user_service.js";
import {getExamResults} from "@/services/results_service.js";
import InfoUsers from "../dialogs/InfoUsers.vue";
import ConfirmDialog from "../dialogs/ConfirmDialog.vue";

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["userDeleted", "editUser", "usersUpdated"]);
const expiredUsers = ref(0);
const infoUsersRef = ref(null);
const searchQuery = ref("");
const isLoading = ref(false);
const showConfirmDialog = ref(false);
const showConfirmDeleteAllDialog = ref(false);
const userToDelete = ref(null);
const isDeleteAllLoading = ref(false);

const deleteUser = async (userId) => {
  try {
    await userService.deleteUser(userId);
    emit("userDeleted", userId);
    logInfo(`Usuario eliminado: ${userId}`);
  } catch (error) {
    logError(`Error al eliminar usuario: ${error.message}`);
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
  showConfirmDialog.value = true;
};

const handleConfirmDelete = async () => {
  if (userToDelete.value) {
    await deleteUser(userToDelete.value.id);
    showConfirmDialog.value = false;
    userToDelete.value = null;
  }
};

const handleCancelDelete = () => {
  showConfirmDialog.value = false;
  userToDelete.value = null;
};

const editUser = (user) => {
  emit("editUser", user);
};

async function showModal(user) {
  try {
    const results = await getExamResults(user.numeroDocumento);
    infoUsersRef.value.openModal(user, results);
  } catch (error) {
    logError(`Error al obtener resultados para el usuario: ${error.message}`);
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return props.users;
  const query = searchQuery.value.toLowerCase();
  return props.users.filter(user =>
      user.nombre.toLowerCase().includes(query) ||
      user.apellidos.toLowerCase().includes(query) ||
      user.numeroDocumento.includes(query)
  );
});

const updateExpiredUsersCount = async () => {
  try {
    expiredUsers.value = await userService.countUsersToDelete();
  } catch (error) {
    logError(`Error al contar usuarios expirados: ${error.message}`);
  }
};

const confirmDeleteAllUsers = () => {
  showConfirmDeleteAllDialog.value = true;
};

const deleteExpiredUsers = async () => {
  try {
    isDeleteAllLoading.value = true;
    showConfirmDeleteAllDialog.value = false;
    const deletedCount = await userService.deleteOldUsers();
    logInfo(`${deletedCount} usuarios antiguos eliminados`);
    expiredUsers.value = 0;
    emit("usersUpdated");
  } catch (error) {
    logError(`Error al eliminar usuarios antiguos: ${error.message}`);
  } finally {
    isDeleteAllLoading.value = false;
  }
};

onMounted(updateExpiredUsersCount);
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
          >Search</label>
          <div class="relative">
            <div
                class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            >
              <Search class="text-color-gray"/>
            </div>
            <input
                v-model="searchQuery"
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
            @click="confirmDeleteAllUsers"
            :disabled="expiredUsers === 0 || isLoading || isDeleteAllLoading"
            class="border-[2px] border-color-red py-[10px] px-[15px] rounded-md text-size-14 hover:bg-color-red hover:text-white transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isDeleteAllLoading ? 'Eliminando...' : `Eliminar ${expiredUsers} usuarios` }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto bg-gray-100 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
        <tr>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            #
          </th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tipo Doc.
          </th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Documento
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Apellidos
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Categoría
          </th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Imagen
          </th>
          <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
        <tr
            v-for="(user, index) in filteredUsers"
            :key="user.id"
            @click="showModal(user)"
            class="cursor-pointer"
        >
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ index + 1 }}
          </td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ user.tipoDocumento }}
          </td>
          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ user.numeroDocumento }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
            {{ user.apellidos }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
            {{ user.nombre }}
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
          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium" @click.stop>
            <div class="flex justify-center space-x-4">
              <button
                  @click="editUser(user)"
                  class="text-indigo-600 hover:text-indigo-900"
              >
                <Edit2 class="h-5 w-5"/>
              </button>
              <button
                  @click="confirmDelete(user)"
                  class="text-red-600 hover:text-red-900"
              >
                <Trash2 class="h-5 w-5"/>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoUsers ref="infoUsersRef"/>
  <ConfirmDialog
      :is-open="showConfirmDialog"
      title="Confirmar eliminación"
      message="¿Estás seguro de que quieres eliminar este usuario?"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
  />
  <ConfirmDialog
      :is-open="showConfirmDeleteAllDialog"
      title="Confirmar eliminación masiva"
      :message="`¿Estás seguro de que quieres eliminar ${expiredUsers} usuarios?`"
      @confirm="deleteExpiredUsers"
      @cancel="showConfirmDeleteAllDialog = false"
  />
</template>

<style scoped>
/* Agregue cualquier estilo específico si es necesario */
</style>
