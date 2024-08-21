<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Siren } from 'lucide-vue-next';

const currentYear = new Date().getFullYear();
const ip = "192.168.140.142";
const mac = "6C-4B-90-B9-B7-2D";

// Usar useRoute para obtener la ruta actual
const route = useRoute();
const isRootRoute = ref(route.path === '/');

// Reaccionar a los cambios en la ruta
onMounted(() => {
  isRootRoute.value = route.path === '/';
});
</script>

<template>
  <footer
    class="bg-red-700 text-white px-[10px] text-sm flex justify-between items-center text-size-11 h-[25px]"
  >
    <div class="flex flex-row items-center h-full">
      <div class="flex items-center gap-[4px] mr-[14px]">
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <rect y="0.5" width="16" height="16" fill="url(#pattern0_10_147)" />
          <defs>
            <pattern
              id="pattern0_10_147"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <use xlink:href="#image0_10_147" transform="scale(0.015625)" />
            </pattern>
            <image
              id="image0_10_147"
              width="64"
              height="64"
              xlink:href="data:image/png;base64,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"
            />
          </defs>
        </svg>
        <p>{{ ip }}</p>
      </div>
      <div class="flex items-center gap-[4px] border-l-2 pl-[4px] mr-[14px]">
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <rect y="0.5" width="16" height="16" fill="url(#pattern0_10_151)" />
          <defs>
            <pattern
              id="pattern0_10_151"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <use xlink:href="#image0_10_151" transform="scale(0.015625)" />
            </pattern>
            <image
              id="image0_10_151"
              width="64"
              height="64"
              xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA6VJREFUeJztmk1vDWEUgM/bqC5YEULSihWx0bJQIdJELDTSxFf8AuEHNBI/wceqwU6sxKKKJmwsbNlZWBFs7r2UaIlaaAmPxby3bs9978w737e58yST6Zw558w5576f0xGpqKjoZUyRDwPWi8hJe+wXkUF7qyEiL0VkVkRmjTG/ioyrEIDTwHuieQecKjvezAD6gGseiWuuAn1lx58a4HqC5JtcKTv+VBA0e80SMAWMAhvsMQrcAJYd+ifLziMRwHra+3wDGA6xGbE6rbwF+ouMPROAc45fftjeGwJmgEV7PAJ223v7HC3hbLnZJAC4p5KYsvIhYMHR1L8CQ1bnprp3t9xsEgC8UUkcsPIZR/JNpq3OQSV/XW42CQB+qCQ2WvliSAG+W52NSv4jrzjznGe17z8eNtjzXyXPbcWaZwG+qOtN9vwsxOapPW+O8JUZeRZgXl1vt+fLIvLNob8gIpNKt8maLEBNXe8TETHGvBGRYRG5LyKL9pgWkRFjTMPq7o/w1f0Al9RAdjuG7R1lOxlt1WUAh1QSc3hsbgg2T3PKdrSImDMFGHBMhYc97Mb01AgM5BVnbmOAMWZZRB4q8XkP0wvq+oH1VQzAGeBjx6UK1IFxT1/HlO1PYEuI/jba9wFHs8vOA0f/c+E1KhP0Z70jnArRv6V031H0SxHPAhDtacXfRWX6C9jl0NsD/Fa6ujvkD9FdIG4BBoAPynzWofdE6TTIcfCLjU+riMl4i++JHPxrnGOX9yYD/H91Tz6JyF4JZqJXIrI1Y/8u6saYHa2CMgsgIvJYggKcyMG3E2PMqpzLLkDh6AJ4oztUQh/9wPOQfvqC4L9HmZFF3Jk6AnYC847kPwOD0R5iP6+7CmB9HSF4S9xkCRhL4zPkWd1XAOtvgmBqqgETaf2FPKeYAgAnCBYvq+bbTvKQ5zT14+L0X2QB6i23a1HykOfUSU6b/yIL4LwfIu/UYlIRN+7E6wA9n3a6HyKvy/8PJFZWaK4g4+Ab18q1r+McChBLnnVcTdb+BwgpqQpQdgBls67sAKJIOyhG0fMtIMsCfMzo74Ykp57CNhyPBccpgnd/H2j5zi+BfJxkq8EacDxu3JmtA7qVah0QQVWAsgMom8TrgLzn56Lo+RbQawVoWyf0UgHq0v7tQfIxwHcd4Lt+SPt+IOk6pZdagJPCd4NpZ4+sZ5+ebwFxCtBp9xZFkt1d62id1j4bOu3ePOzi7u5W7erS2ldUVFSE8Q8VAcn6zMwhiQAAAABJRU5ErkJggg=="
            />
          </defs>
        </svg>
        <p>{{ mac }}</p>
      </div>
      <p class="border-l-2 pl-[4px] text-center capitalize">
        &copy Desarrollado por la oficina de tecnología de información oGTI -
        ministerio de transporte y comunicaciones - &copy {{ currentYear }} (v
        1.0.1)
      </p>
    </div>
    <div class="flex flex-row items-center pr-[60px]">
      <div class="border-l-2 pl-[4px] mr-[60px]">
        <Siren class="w-[20px]" />
      </div>
      <div class="border-l-2 border-r-2 pr-[15px] pl-[4px]">
        <span>.NET 7.0.0.28</span>
      </div>
      <!-- Mostrar el botón de admin solo si estamos en la ruta raíz -->
      <div v-if="isRootRoute" class="border-r-2 flex justify-center items-center w-[100px] hover:bg-red-300 hover:text-black">
        <router-link to="/login-admin" class="text-center">Admin</router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
