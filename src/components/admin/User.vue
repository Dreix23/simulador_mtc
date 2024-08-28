<script setup>
import { ref } from "vue";
import UserForm from "./users/UserForm.vue";
import UserList from "./users/UserList.vue";
import { logInfo } from "@/utils/logger.js";

const users = ref([]);

const addUser = (user) => {
  if (!user.dni || !user.apellidos || !user.nombre) {
    return;
  }
  logInfo(`Emitiendo evento user-added: ${user.nombre} ${user.apellidos}`);
  users.value.push(user);
  logInfo(`Usuario añadido al listado: ${user.nombre} ${user.apellidos}`);
};

const deleteUser = (index) => {
  const deletedUser = users.value[index];
  users.value.splice(index, 1);
  logInfo(`Usuario eliminado: ${deletedUser.nombre} ${deletedUser.apellidos}`);
};
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Formulario de Usuario</h2>
    <UserForm @user-added="addUser"/>
    <UserList :users="users" @delete-user="deleteUser"/>
  </div>
</template>

<style scoped>
</style>
