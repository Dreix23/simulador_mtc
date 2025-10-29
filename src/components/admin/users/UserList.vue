<script setup>
import {ref, computed, onMounted} from "vue";
import {Trash2, Edit2, Search, Loader2, Filter, ChevronDown} from "lucide-vue-next";
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
const switchLoading = ref(null);
const categoryFilter = ref("all");
const showDropdown = ref(false);

// Opciones del filtro
const filterOptions = [
  { value: "all", label: "Todas las categorías", icon: "🗂️" },
  { value: "A", label: "Categorías A", icon: "🅰️" },
  { value: "B", label: "Categorías B", icon: "🅱️" }
];

// Obtener la opción seleccionada actual
const selectedOption = computed(() =>
    filterOptions.find(opt => opt.value === categoryFilter.value)
);

// Función para seleccionar filtro
const selectFilter = (value) => {
  categoryFilter.value = value;
  showDropdown.value = false;
  logInfo(`Filtro aplicado: ${value}`);
};

// Función para determinar el tipo de categoría
const getCategoryType = (category) => {
  if (!category) return null;

  const normalizedCategory = category.replace(/-/g, '').toUpperCase();
  const categoriesA = ['AI', 'AIIA', 'AIIB', 'AIIIA', 'AIIIB', 'AIIIC'];
  const categoriesB = ['BIIA', 'BIIB', 'BIIC'];

  if (categoriesA.includes(normalizedCategory)) {
    return 'A';
  } else if (categoriesB.includes(normalizedCategory)) {
    return 'B';
  }

  return null;
};

const toggleUserAttempt = async (user) => {
  try {
    switchLoading.value = user.id;
    await userService.updateUserAttempt(user.id, !user.hasAttempt);
    emit("usersUpdated");
    logInfo(`Estado de intento actualizado para usuario: ${user.id}`);
  } catch (error) {
    logError(`Error al actualizar intento: ${error.message}`);
  } finally {
    switchLoading.value = null;
  }
};

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
  let filtered = props.users;

  // Aplicar filtro de categoría
  if (categoryFilter.value !== "all") {
    filtered = filtered.filter(user => {
      const userCategoryType = getCategoryType(user.categoria);
      return userCategoryType === categoryFilter.value;
    });
  }

  // Aplicar filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(query) ||
        user.apellidos.toLowerCase().includes(query) ||
        user.numeroDocumento.includes(query)
    );
  }

  // Ordenar por fecha más reciente
  return filtered.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt - a.createdAt;
    }
    return 0;
  });
});

// Contador de usuarios por categoría
const categoryCount = computed(() => {
  const counts = { all: props.users.length, A: 0, B: 0 };

  props.users.forEach(user => {
    const type = getCategoryType(user.categoria);
    if (type === 'A') counts.A++;
    else if (type === 'B') counts.B++;
  });

  return counts;
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

// Cerrar dropdown al hacer clic fuera
const handleClickOutside = (event) => {
  const dropdown = document.getElementById('category-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  updateExpiredUsersCount();
  document.addEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="mt-10">
    <div class="flex justify-between items-center mb-[20px]">
      <h3 class="text-xl font-semibold">Lista de Usuarios</h3>

      <!-- Buscador -->
      <div>
        <form class="max-w-md mx-auto">
          <label
              for="default-search"
              class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search class="text-color-gray"/>
            </div>
            <input
                v-model="searchQuery"
                type="search"
                id="default-search"
                class="block w-full p-[10px] ps-10 text-size-14 outline-none min-w-[400px] border-[2px] rounded-md border-color-gray-line focus:border-color-blue-max"
                placeholder="Buscar usuario por Nombres, apellidos o DNI"
                required
            />
          </div>
        </form>
      </div>

      <!-- Contenedor de filtro y botón eliminar -->
      <div class="flex items-center gap-3">
        <!-- Dropdown de filtro personalizado -->
        <div id="category-dropdown" class="relative">
          <button
              @click="showDropdown = !showDropdown"
              class="flex items-center justify-between gap-3 px-4 py-[10px] bg-white border-[2px] border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
          >
            <div class="flex items-center gap-2">
              <Filter class="w-4 h-4 text-gray-500" />
              <span class="text-size-14 font-medium text-gray-700">
                {{ selectedOption.label }}
              </span>
            </div>
            <ChevronDown
                :class="['w-4 h-4 text-gray-500 transition-transform duration-200',
                      showDropdown ? 'rotate-180' : '']"
            />
          </button>

          <!-- Dropdown Menu -->
          <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
          >
            <div
                v-if="showDropdown"
                class="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            >
              <div class="py-1">
                <button
                    v-for="option in filterOptions"
                    :key="option.value"
                    @click="selectFilter(option.value)"
                    :class="[
                    'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between group',
                    categoryFilter === option.value ? 'bg-blue-50' : ''
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-lg">{{ option.icon }}</span>
                    <div>
                      <p :class="[
                        'text-sm font-medium',
                        categoryFilter === option.value ? 'text-blue-600' : 'text-gray-700'
                      ]">
                        {{ option.label }}
                      </p>
                      <p class="text-xs text-gray-500 mt-0.5">
                        {{ categoryCount[option.value] }} usuarios
                      </p>
                    </div>
                  </div>
                  <div
                      v-if="categoryFilter === option.value"
                      class="w-2 h-2 bg-blue-600 rounded-full"
                  ></div>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Botón eliminar -->
        <button
            @click="confirmDeleteAllUsers"
            :disabled="expiredUsers === 0 || isLoading || isDeleteAllLoading"
            class="flex items-center gap-2 border-[2px] border-color-red py-[10px] px-[15px] rounded-lg text-size-14 hover:bg-color-red hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Trash2 class="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>{{ isDeleteAllLoading ? 'Eliminando...' : `Eliminar ${expiredUsers} usuarios` }}</span>
        </button>
      </div>
    </div>

    <!-- Indicador de filtro activo con animación -->
    <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
    >
      <div v-if="categoryFilter !== 'all'" class="mb-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-center gap-2 flex-1">
          <Filter class="w-4 h-4 text-blue-600" />
          <span class="text-sm text-blue-700 font-medium">
            Mostrando únicamente categorías {{ categoryFilter }}
          </span>
          <span class="text-sm text-blue-600">
            ({{ filteredUsers.length }} de {{ props.users.length }} usuarios)
          </span>
        </div>
        <button
            @click="categoryFilter = 'all'"
            class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>

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
            Nombres
          </th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Categoría
          </th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Imagen
          </th>
          <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Intento
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
            class="cursor-pointer hover:bg-gray-50 transition-colors"
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
          <td class="px-3 py-4 whitespace-nowrap">
            <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getCategoryType(user.categoria) === 'A'
                ? 'bg-green-100 text-green-800'
                : getCategoryType(user.categoria) === 'B'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'"
            >
              {{ user.categoria }}
            </span>
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
            <div class="flex justify-center">
              <button
                  @click="toggleUserAttempt(user)"
                  :disabled="switchLoading === user.id"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  :class="[user.hasAttempt !== false ? 'bg-blue-600' : 'bg-gray-200']"
              >
                <span v-if="switchLoading === user.id"
                      class="absolute inset-0 flex items-center justify-center">
                  <Loader2 class="h-4 w-4 text-white animate-spin" />
                </span>
                <span
                    v-else
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="[user.hasAttempt !== false ? 'translate-x-5' : 'translate-x-0']"
                />
              </button>
            </div>
          </td>
          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium" @click.stop>
            <div class="flex justify-center space-x-4">
              <button
                  @click="editUser(user)"
                  class="text-indigo-600 hover:text-indigo-900 transition-colors"
              >
                <Edit2 class="h-5 w-5"/>
              </button>
              <button
                  @click="confirmDelete(user)"
                  class="text-red-600 hover:text-red-900 transition-colors"
              >
                <Trash2 class="h-5 w-5"/>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Mensaje cuando no hay resultados con mejor diseño -->
      <div v-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-lg font-medium text-gray-600 mb-2">No se encontraron usuarios</p>
        <p class="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
      </div>
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
</style>