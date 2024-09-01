<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import UserForm from './users/UserForm.vue';
import UserList from './users/UserList.vue';
import { userService } from '@/services/user_service.js';

const users = ref([]);
let unsubscribe = null;

const fetchUsers = () => {
  unsubscribe = userService.getUsersSnapshot((updatedUsers) => {
    users.value = updatedUsers;
  });
};

const handleUserDeleted = (userId) => {
  users.value = users.value.filter(user => user.id !== userId);
};

onMounted(() => {
  fetchUsers();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Formulario de Usuario</h2>
    <UserForm />
    <UserList :users="users" @user-deleted="handleUserDeleted" />
  </div>
</template>

<style scoped>
</style>
