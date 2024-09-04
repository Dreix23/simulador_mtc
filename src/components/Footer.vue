<script setup>
import { ref, onMounted, onUnmounted, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { Siren } from "lucide-vue-next";
import MacImg from "@/assets/images/mac.svg";
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import { FooterService } from '@/services/footer_service';

const currentYear = new Date().getFullYear();
const ip = shallowRef("No asignada");
const mac = shallowRef("No asignada");
const deviceId = shallowRef("");
const deviceToken = shallowRef("");

const route = useRoute();
const isRootRoute = shallowRef(route.path === "/");

let unsubscribe = null;

const loadLocalData = () => {
  const cachedData = localStorage.getItem('deviceInfo');
  if (cachedData) {
    const { ip: cachedIp, mac: cachedMac, deviceId: cachedId, deviceToken: cachedToken } = JSON.parse(cachedData);
    ip.value = cachedIp || "No asignada";
    mac.value = cachedMac || "No asignada";
    deviceId.value = cachedId || "";
    deviceToken.value = cachedToken || "";
    logDebug('Datos cargados desde localStorage');
  }
};

onMounted(async () => {
  isRootRoute.value = route.path === "/";
  logInfo("Footer component mounted");

  loadLocalData();

  try {
    if (!deviceId.value || !deviceToken.value) {
      const { id, token } = await FooterService.getOrCreateDeviceIdentifier();
      deviceId.value = id;
      deviceToken.value = token;
      logInfo(`Nuevo dispositivo creado: ID=${id}, Token=${token}`);
    }

    if (deviceId.value) {
      unsubscribe = FooterService.subscribeToDeviceInfo(deviceId.value, (deviceInfo) => {
        if (deviceInfo) {
          ip.value = deviceInfo.ip || "No asignada";
          mac.value = deviceInfo.mac || "No asignada";
          logInfo(`Información del dispositivo actualizada: IP=${ip.value}, MAC=${mac.value}`);
          localStorage.setItem('deviceInfo', JSON.stringify({
            ip: ip.value,
            mac: mac.value,
            deviceId: deviceId.value,
            deviceToken: deviceToken.value
          }));
        }
      });
    }
  } catch (error) {
    logError(`Error al inicializar el componente Footer: ${error.message}`);
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <footer
      class="bg-red-700 text-white px-[10px] text-sm fixed bottom-0 w-full flex justify-between items-center text-size-11 h-[30px] responsive-footer"
  >
    <div class="flex flex-row items-center h-full overflow-hidden">
      <div class="flex items-center gap-[4px] mr-[14px]">
        <span class="icon-[mdi--ip-network] text-[16px]"></span>
        <p class="truncate">{{ ip }}</p>
      </div>
      <div class="flex items-center gap-[4px] border-l-2 pl-[4px] mr-[14px]">
        <img :src="MacImg" alt="">
        <p class="truncate">{{ mac }}</p>
      </div>
      <p class="border-l-2 pl-[4px] text-center capitalize truncate">
        &copy; Desarrollado por la oficina de tecnología de información oGTI -
        ministerio de transporte y comunicaciones - &copy; {{ currentYear }} (v
        1.0.1)
      </p>
    </div>
    <div class="flex flex-row items-center pr-[60px]">
      <div class="border-l-2 pl-[4px] mr-[60px]">
        <Siren class="w-[20px]"/>
      </div>
      <div class="border-l-2 border-r-2 pr-[15px] pl-[4px]">
        <span class="truncate">.NET 7.0.0.28</span>
      </div>
      <div
          v-if="isRootRoute"
          class="border-r-2 flex justify-center items-center w-[100px] hover:bg-red-300 hover:text-black"
      >
        <router-link to="/login-admin" class="text-center truncate">Admin</router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@media screen and (max-width: 1599px) {
  .responsive-footer {
    height: 27px;
    padding-top: 4.5px;
    padding-bottom: 4.5px;
    font-size: 12px;
  }

  .responsive-footer .icon-\[mdi--ip-network\] {
    font-size: 15.2px;
  }

  .responsive-footer .w-\[20px\] {
    width: 19px;
    height: 19px;
  }
}
</style>
