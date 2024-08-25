<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const handleLogin = () => {
  // Redirige directamente al AdminView sin autenticación
  router.push({ name: "Admin" });
};
</script>

<template>
  <main class="flex justify-center items-center h-[100vh]">
    <div class="login-container">
      <h2 class="text-2xl font-bold mb-4">Acceso al Panel de Administración</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <button
              type="submit"
              class="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Acceder al Panel de Administración
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.login-container {
  width: 400px;
  margin: auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
