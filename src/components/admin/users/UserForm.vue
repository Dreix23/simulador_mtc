<script setup>
import { ref } from "vue";
import { logError, logInfo } from "@/utils/logger.js";
import InputField from "@/elements/admin/users/InputField.vue";
import SelectField from "@/elements/admin/users/SelectField.vue";
import ImageUpload from "@/elements/admin/users/ImageUpload.vue";
import ActionButton from "@/elements/admin/users/ActionButton.vue";

const emit = defineEmits(['user-added']);

const documentTypes = [
  "DNI",
  "CARNET DE EXTRANJERIA",
  "CARNET DE SOLICITANTE DE REFUGIO",
  "PERMISO TEMPORAL DE PERMANENCIA",
  "CEDULA DE IDENTIDAD DIPLOMATICA",
];

const newUser = ref({
  tipoDocumento: "DNI",
  numeroDocumento: "",
  apellidos: "",
  nombre: "",
  fechaNacimiento: "",
  categoria: "A",
  imagen: null,
});

const isLoading = ref({
  addUser: false,
  downloadExcel: false,
  uploadExcel: false
});

const fileInput = ref(null);

const addUser = async () => {
  if (!newUser.value.numeroDocumento || !newUser.value.apellidos || !newUser.value.nombre || !newUser.value.fechaNacimiento) {
    logError("Todos los campos son obligatorios");
    return;
  }
  isLoading.value.addUser = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const userToAdd = JSON.parse(JSON.stringify(newUser.value));
    if (userToAdd.imagen) {
      userToAdd.imagenUrl = URL.createObjectURL(userToAdd.imagen);
    }
    emit('user-added', userToAdd);
    newUser.value = {
      tipoDocumento: "DNI",
      numeroDocumento: "",
      apellidos: "",
      nombre: "",
      fechaNacimiento: "",
      categoria: "A",
      imagen: null,
    };
  } catch (error) {
    logError(`Error al añadir usuario: ${error.message}`);
  } finally {
    isLoading.value.addUser = false;
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newUser.value.imagen = file;
  }
};

const downloadExcelTemplate = async () => {
  isLoading.value.downloadExcel = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Aquí iría la lógica real para descargar el archivo
    logInfo("Plantilla de Excel descargada correctamente");
  } catch (error) {
    logError(`Error al descargar la plantilla de Excel: ${error.message}`);
  } finally {
    isLoading.value.downloadExcel = false;
  }
};

const uploadExcel = async () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleExcelUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    isLoading.value.uploadExcel = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Aquí iría la lógica real para procesar el archivo Excel
      logInfo("Archivo Excel procesado correctamente");
    } catch (error) {
      logError(`Error al procesar el archivo Excel: ${error.message}`);
    } finally {
      isLoading.value.uploadExcel = false;
      event.target.value = '';
    }
  }
};
</script>

<template>
  <div class="flex flex-col gap-4 mb-6">
    <div class="flex justify-between items-center">
      <div class="flex-1 mr-2 relative">
        <select
            v-model="newUser.tipoDocumento"
            class="absolute right-0 top-0 text-sm bg-transparent border-none focus:ring-0 z-10"
        >
          <option v-for="type in documentTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <div class="mt-7">
          <InputField
              id="numeroDocumento"
              v-model="newUser.numeroDocumento"
              :placeholder="newUser.tipoDocumento"
              :maxlength="20"
              :flex="1"
          />
        </div>
      </div>

      <InputField id="apellidos" v-model="newUser.apellidos" label="Apellidos" placeholder="Apellidos" :flex="0.25"/>
      <InputField id="nombre" v-model="newUser.nombre" label="Nombre" placeholder="Nombre" :flex="0.25"/>
      <InputField id="fechaNacimiento" v-model="newUser.fechaNacimiento" label="F. Nacimiento" type="date"
                  :flex="0.15" required/>
      <SelectField id="categoria" v-model="newUser.categoria" label="Categoría"
                   :options="[{value: 'A', label: 'A'}, {value: 'B', label: 'B'}, {value: 'C', label: 'C'}]"
                   :flex="0.1"/>
      <ImageUpload v-model="newUser.imagen" @change="handleImageUpload"/>
    </div>
    <div class="flex justify-between">
      <div class="space-x-4">
        <ActionButton @click="downloadExcelTemplate" :isLoading="isLoading.downloadExcel" icon="FileDown"
                      text="Modelo Excel" color="green"/>
        <ActionButton @click="uploadExcel" :isLoading="isLoading.uploadExcel" icon="FileUp" text="Subir Excel"
                      color="blue"/>
        <input type="file" ref="fileInput" @change="handleExcelUpload" accept=".xlsx,.xls" class="hidden"/>
      </div>
      <ActionButton @click="addUser" :isLoading="isLoading.addUser" icon="UserPlus" text="Guardar" color="indigo"
                    :disabled="!newUser.numeroDocumento || !newUser.apellidos || !newUser.nombre || !newUser.fechaNacimiento"/>
    </div>
  </div>
</template>

<style scoped>
</style>
