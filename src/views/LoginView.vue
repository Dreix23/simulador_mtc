<script setup>
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { EyeOff, Eye } from 'lucide-vue-next'; // Asegúrate de importar los íconos de heroicons o el paquete que estés utilizando

const router = useRouter();
const showPassword = ref(false);

const handleLogin = () => {
  // Redirige directamente al AdminView sin autenticación
  router.push({ name: "Admin" });
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <main class="flex justify-center items-center h-[100vh]">
    <div class="login-container">
      <h2 class="text-2xl font-bold mb-[5px] text-center">Login</h2>
      <p class="uppercase text-size-14 text-center">Inicia sesión para acceder a tu cuenta</p>
      <form @submit.prevent="handleLogin" class="mt-[15px] flex flex-col gap-[20px]">
        <div class="flex flex-col gap-[5px]">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="nombre@gmail.com" class="input-login">
        </div>
        <div class="flex flex-col gap-[5px] relative">
          <label for="password">Contraseña</label>
          <input :type="showPassword ? 'text' : 'password'" id="password" placeholder="*******************" class="input-login">
          <span @click="togglePasswordVisibility" class="absolute right-3 top-9 cursor-pointer">
            <component :is="showPassword ? Eye : EyeOff" />
          </span>
        </div>
        <div class="flex justify-end">
          <a href="#">¿Recuperar la contraseña?</a>
        </div>
        <button type="submit" class="bg-color-red-bg text-white py-[7px] rounded-[8px]">
          Entrar
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.input-login {
  border: 1px solid #D1D5DB;
  padding: 9px 12px;
  border-radius: 8px;
  width: 100%;
}
.login-container {
  width: 400px;
  margin: auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
