<script setup>
import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
import MacBlackImg from "@/assets/images/macblack.svg";
import { FooterService } from '@/services/footer_service';
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import { Loader2 } from 'lucide-vue-next';

const ip = shallowRef('');
const mac = shallowRef('');
const deviceId = shallowRef('');
const isLoading = shallowRef(false);
let unsubscribe = null;

const updateDeviceInfo = async () => {
  if (!deviceId.value) {
    logError('No se ha obtenido un identificador de dispositivo válido');
    return;
  }

  isLoading.value = true;
  try {
    const success = await FooterService.updateDeviceInfo(deviceId.value, ip.value, mac.value);
    if (success) {
      logInfo('Información del dispositivo actualizada correctamente');
      localStorage.setItem('deviceInfo', JSON.stringify({ ip: ip.value, mac: mac.value }));
    } else {
      logError('No se pudo actualizar la información del dispositivo');
    }
  } catch (error) {
    logError(`Error al actualizar la información del dispositivo: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const loadLocalData = () => {
  const cachedData = localStorage.getItem('deviceInfo');
  if (cachedData) {
    const { ip: cachedIp, mac: cachedMac } = JSON.parse(cachedData);
    ip.value = cachedIp || '';
    mac.value = cachedMac || '';
    logDebug('Datos cargados desde localStorage');
  }
};

onMounted(async () => {
  loadLocalData(); // Carga los datos del localStorage inmediatamente

  try {
    deviceId.value = await FooterService.getOrCreateDeviceIdentifier();
    if (deviceId.value) {
      unsubscribe = FooterService.subscribeToDeviceInfo(deviceId.value, (deviceInfo) => {
        if (deviceInfo) {
          ip.value = deviceInfo.ip || '';
          mac.value = deviceInfo.mac || '';
          logInfo(`Información del dispositivo actualizada: IP=${ip.value}, MAC=${mac.value}`);
          localStorage.setItem('deviceInfo', JSON.stringify({ ip: ip.value, mac: mac.value }));
        }
      });
    }
  } catch (error) {
    logError(`Error al inicializar el componente: ${error.message}`);
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Cambiar IP y MAC</h2>
    <div class="flex justify-center">
      <div
          class="w-full max-w-[300px] h-[260px] flex justify-center items-start pt-[22px] bg-[url('@/assets/images/desktop.svg')] bg-cover bg-no-repeat"
      >
        <form @submit.prevent="updateDeviceInfo" class="flex flex-col gap-[15px] items-center w-full max-w-[200px]">
          <div class="flex items-center gap-[5px] w-full">
            <label for="ip" class="block text-sm font-medium text-gray-700">
              <span class="icon-[mdi--ip-network-outline] text-[24px]"></span>
            </label>
            <input
                id="ip"
                v-model="ip"
                type="text"
                placeholder="Dirección IP"
                class="w-full focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-2 border-gray-300 rounded-md h-[35px] px-3"
            />
          </div>
          <div class="flex items-center gap-[5px] w-full">
            <label for="mac" class="block text-sm font-medium text-gray-700">
              <img :src="MacBlackImg" alt="" class="w-[24px] h-[24px]" />
            </label>
            <input
                id="mac"
                v-model="mac"
                type="text"
                placeholder="Dirección MAC"
                class="w-full focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-2 border-gray-300 rounded-md h-[35px] px-3"
            />
          </div>
          <button
              type="submit"
              class="h-[35px] flex w-full justify-center items-center rounded-[8px] text-size-12 bg-blue-600 hover:bg-blue-700 text-white"
              :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" class="animate-spin" />
            <span v-else>Guardar</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .icon-[mdi--ip-network-outline] {
    font-size: 20px;
  }

  img[src*="MacBlackImg"] {
    width: 20px;
    height: 20px;
  }
}
</style>
