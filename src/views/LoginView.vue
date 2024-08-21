<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

const handleLogin = () => {
  // Lógica de autenticación aquí
  if (email.value === "admin@example.com" && password.value === "password") {
    router.push({ name: "Dashboard" }); // Redirige al usuario a una página de éxito
  } else {
    errorMessage.value = "Correo electrónico o contraseña incorrectos";
  }
};
</script>

<template>
  <main class="flex justify-center items-center h-[100vh]">
    <div class="login-container">
      <h2 class="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Correo electrónico</label
          >
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Ingrese su correo electrónico"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >Contraseña</label
          >
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Ingrese su contraseña"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar sesión
          </button>
        </div>
        <div v-if="errorMessage" class="text-red-600 mt-2">
          {{ errorMessage }}
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
