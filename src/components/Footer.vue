<script setup>
import { ref, onMounted, onUnmounted, shallowRef } from "vue";
import { useRoute } from "vue-router";
import MacImg from "@/assets/images/mac.svg";
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import { FooterService } from '@/services/footer_service';

const defaultIp = "192.168.140.142";
const defaultMac = "6C-4B-90-B9-B7-2B";
const ip = shallowRef(defaultIp);
const mac = shallowRef(defaultMac);
const deviceId = shallowRef("");
const deviceToken = shallowRef("");

const route = useRoute();
const isRootRoute = shallowRef(route.path === "/");

let unsubscribe = null;

const loadLocalData = () => {
  const cachedData = localStorage.getItem('deviceInfo');
  if (cachedData) {
    const { ip: cachedIp, mac: cachedMac, deviceId: cachedId, deviceToken: cachedToken } = JSON.parse(cachedData);
    ip.value = cachedIp && cachedIp !== "No asignada" ? cachedIp : defaultIp;
    mac.value = cachedMac && cachedMac !== "No asignada" ? cachedMac : defaultMac;
    deviceId.value = cachedId || "";
    deviceToken.value = cachedToken || "";
  }
};

const ensureDeviceInFirebase = async () => {
  try {
    const { id, token } = await FooterService.getOrCreateDeviceIdentifier();
    deviceId.value = id;
    deviceToken.value = token;

    // Actualizar la información del dispositivo en Firebase
    await FooterService.updateDeviceInfo(id, token, ip.value, mac.value);

    logInfo(`Dispositivo asegurado en Firebase: ${id}`);
  } catch (error) {
    logError(`Error al asegurar el dispositivo en Firebase: ${error.message}`);
  }
};

onMounted(async () => {
  isRootRoute.value = route.path === "/";
  loadLocalData();

  try {
    await ensureDeviceInFirebase();

    if (deviceId.value && deviceToken.value) {
      unsubscribe = FooterService.subscribeToDeviceInfo(
          deviceId.value,
          deviceToken.value,
          (deviceInfo) => {
            if (deviceInfo) {
              ip.value = deviceInfo.ip && deviceInfo.ip !== "No asignada" ? deviceInfo.ip : defaultIp;
              mac.value = deviceInfo.mac && deviceInfo.mac !== "No asignada" ? deviceInfo.mac : defaultMac;
            }
          }
      );
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
        ministerio de transporte y comunicaciones - &copy; 2022 (v
        1.0.1)
      </p>
    </div>
    <div class="flex flex-row items-center  pr-[60px]">
      <div class="border-l-2 pl-[4px] mr-[60px] flex">
        <span class="icon-[mdi--led-on] text-size-18"></span>
      </div>
      <div class="border-l-2 border-r-2 pr-[15px] pl-[4px]">
        <span class="truncate">.NET 7.0.0.28</span>
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
