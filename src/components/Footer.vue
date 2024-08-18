<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-red-700 text-white py-2 px-6 text-sm flex justify-center items-center">
    <p class="text-center">© {{ currentYear }} Ministerio de Transportes y Comunicaciones - Sistema Nacional de Conductores</p>
  </footer>
</template>

<style scoped>
/* Añadir estilos si es necesario */
</style>
