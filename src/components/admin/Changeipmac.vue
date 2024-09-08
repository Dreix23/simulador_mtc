<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import MacBlackImg from "@/assets/images/macblack.svg";
import { FooterService } from '@/services/footer_service';
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import { Loader2 } from 'lucide-vue-next';

const devices = ref([]);
const isLoading = ref(false);
let unsubscribes = [];

const updateDeviceInfo = async (device) => {
  try {
    if (!device.id || !device.deviceToken) {
      logError('No se ha obtenido un identificador de dispositivo válido');
      return;
    }

    isLoading.value = true;
    const success = await FooterService.updateDeviceInfo(device.id, device.deviceToken, device.ip, device.mac);
    if (success) {
      logInfo(`Información del dispositivo ${device.id} actualizada correctamente`);
    } else {
      logError(`No se pudo actualizar la información del dispositivo ${device.id}`);
    }
  } catch (error) {
    logError(`Error al actualizar la información del dispositivo ${device.id}: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const loadDevices = async () => {
  try {
    const allDevices = await FooterService.getAllDevices();
    devices.value = allDevices.map(device => ({
      ...device,
      ip: device.ip === "No asignada" ? "" : device.ip,
      mac: device.mac === "No asignada" ? "" : device.mac
    }));
    logInfo(`Se cargaron ${devices.value.length} dispositivos`);
  } catch (error) {
    logError(`Error al cargar los dispositivos: ${error.message}`);
  }
};

onMounted(async () => {
  try {
    await loadDevices();

    devices.value.forEach(device => {
      const unsubscribe = FooterService.subscribeToDeviceInfo(device.id, device.deviceToken, (deviceInfo) => {
        if (deviceInfo) {
          const index = devices.value.findIndex(d => d.id === device.id);
          if (index !== -1) {
            devices.value[index] = {
              ...devices.value[index],
              ...deviceInfo,
              ip: deviceInfo.ip === "No asignada" ? "" : deviceInfo.ip,
              mac: deviceInfo.mac === "No asignada" ? "" : deviceInfo.mac
            };
          }
          logInfo(`Información del dispositivo ${device.id} actualizada`);
        }
      });
      unsubscribes.push(unsubscribe);
    });
  } catch (error) {
    logError(`Error al inicializar el componente: ${error.message}`);
  }
});

onUnmounted(() => {
  unsubscribes.forEach(unsubscribe => unsubscribe());
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Cambiar IP y MAC</h2>
    <div class="flex flex-wrap justify-center gap-4">
      <div v-for="device in devices" :key="device.id"
           class="w-full max-w-[300px] h-[260px] flex justify-center items-start pt-[22px] bg-[url('@/assets/images/desktop.svg')] bg-cover bg-no-repeat"
      >
        <form @submit.prevent="updateDeviceInfo(device)" class="flex flex-col gap-[15px] items-center w-full max-w-[200px]">
          <div class="flex items-center gap-[5px] w-full">
            <label :for="`ip-${device.id}`" class="block text-sm font-medium text-gray-700">
              <span class="icon-[mdi--ip-network-outline] text-[24px]"></span>
            </label>
            <input
                :id="`ip-${device.id}`"
                v-model="device.ip"
                type="text"
                placeholder="No asignada"
                class="w-full focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-2 border-gray-300 rounded-md h-[35px] px-3"
            />
          </div>
          <div class="flex items-center gap-[5px] w-full">
            <label :for="`mac-${device.id}`" class="block text-sm font-medium text-gray-700">
              <img :src="MacBlackImg" alt="" class="w-[24px] h-[24px]" />
            </label>
            <input
                :id="`mac-${device.id}`"
                v-model="device.mac"
                type="text"
                placeholder="No asignada"
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
