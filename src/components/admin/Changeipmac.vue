<script setup>
import MacBlackImg from "@/assets/images/macblack.svg";
</script>
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800">Cambiar IP y MAC</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-[15px] mt-[20px] place-items-center">
      <div
        class="w-[300px] h-[260px] flex justify-center items-start pt-[22px] bg-[url('@/assets/images/desktop.svg')] bg-cover bg-no-repeat"
      >
        <form action="" class="flex flex-col gap-[15px] items-center">
          <div class="flex items-center gap-[5px]">
            <label for="" class="block text-sm font-medium text-gray-700"
              ><span class="icon-[mdi--ip-network-outline] text-[24px]"></span
            ></label>
            <input
              type="text"
              placeholder="Dirección IP"
              class="max-w-[200px] focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-[35px] px-3"
            />
          </div>
          <div class="flex items-center gap-[5px]">
            <label for="" class="block text-sm font-medium text-gray-700">
              <img :src="MacBlackImg" alt="" class="w-[24px] h-[24px]" />
            </label>
            <input
              type="text"
              placeholder="Dirección MAC"
              class="max-w-[200px] focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-[35px] px-3"
            />
          </div>
          <button
            type="submit"
            class="h-[35px] flex w-fit py-[5px] px-[15px] justify-center items-center rounded-[8px] text-size-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
