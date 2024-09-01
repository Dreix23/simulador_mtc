<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import UserForm from './users/UserForm.vue';
import UserList from './users/UserList.vue';
import { userService } from '@/services/user_service.js';
import { logInfo, logError } from "@/utils/logger.js";

const users = ref([]);
const userToEdit = ref(null);
let unsubscribe = null;

const fetchUsers = async () => {
  try {
    // Intentar obtener usuarios del caché primero
    const cachedUsers = await userService.getUsers();
    users.value = cachedUsers;

    // Configurar el listener para actualizaciones en tiempo real
    unsubscribe = userService.getUsersSnapshot((updatedUsers) => {
      users.value = updatedUsers;
      logInfo("Lista de usuarios actualizada en tiempo real");
    });
  } catch (error) {
    logError(`Error al obtener usuarios: ${error.message}`);
  }
};

const handleUserDeleted = (userId) => {
  logInfo(`Usuario eliminado de la lista: ${userId}`);
};

const handleEditUser = (user) => {
  userToEdit.value = user;
  logInfo(`Editando usuario: ${user.id}`);
};

const handleUserAdded = (newUser) => {
  logInfo(`Nuevo usuario agregado: ${newUser.id}`);
};

const handleUserUpdated = (updatedUser) => {
  userToEdit.value = null;
  logInfo(`Usuario actualizado: ${updatedUser.id}`);
};

onMounted(() => {
  fetchUsers();
  logInfo("Componente UserManagement montado");
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    logInfo("Desuscrito de la actualización de usuarios");
  }
});
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Gestión de Usuarios</h2>
    <UserForm
        :user-to-edit="userToEdit"
        @user-added="handleUserAdded"
        @user-updated="handleUserUpdated"
    />
    <UserList
        :users="users"
        @user-deleted="handleUserDeleted"
        @edit-user="handleEditUser"
    />
  </div>
</template>

<style scoped>
</style>
