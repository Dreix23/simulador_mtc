<script setup>
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { EyeOff, Eye, Loader } from 'lucide-vue-next';
import { authService } from '../services/auth_service';

const router = useRouter();
const showPassword = ref(false);
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  try {
    await authService.login(email.value, password.value);
    router.push({ name: "Admin" });
  } catch (error) {
    errorMessage.value = "Error al iniciar sesión. Por favor, verifica tus credenciales.";
  } finally {
    isLoading.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <main class="flex justify-center items-center h-screen bg-gray-100">
    <div class="login-container shadow-lg rounded-lg bg-white p-8">
      <h2 class="text-3xl font-bold mb-2 text-center text-gray-800">Iniciar Sesión</h2>
      <p class="text-sm text-gray-600 text-center mb-6">Accede a tu cuenta</p>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div class="flex flex-col">
          <label for="email" class="text-gray-700">Email</label>
          <input v-model="email" type="email" id="email" placeholder="nombre@gmail.com" class="input-login" required>
        </div>
        <div class="flex flex-col relative">
          <label for="password" class="text-gray-700">Contraseña</label>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" placeholder="*******************" class="input-login" required>
          <span @click="togglePasswordVisibility" class="absolute right-3 top-10 cursor-pointer">
            <component :is="showPassword ? Eye : EyeOff" class="text-gray-500" />
          </span>
        </div>
        <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
        <div class="flex justify-end">
          <a href="#" class="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
        <button type="submit" class="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center" :disabled="isLoading">
          <Loader v-if="isLoading" class="animate-spin mr-2" size="20" />
          {{ isLoading ? 'Cargando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.input-login {
  border: 1px solid #D1D5DB;
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  transition: border-color 0.2s;
}

.input-login:focus {
  border-color: #EF4444;
  outline: none;
}
.login-container {
  width: 400px;
}
</style>
