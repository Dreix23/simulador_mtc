<script setup>
import { ref, watch, computed } from "vue";
import { Loader2, UserPlus, Save } from "lucide-vue-next";
import { logError, logInfo } from "@/utils/logger.js";
import InputField from "@/elements/admin/users/InputField.vue";
import ImageUpload from "@/elements/admin/users/ImageUpload.vue";
import ExcelButtons from "@/elements/admin/users/ExcelButtons.vue";
import { userService } from "@/services/user_service.js";

const props = defineProps({
  userToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['userAdded', 'userUpdated']);

const documentTypes = [
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "CARNET DE EXTRANJERIA" },
  { value: "CSR", label: "CARNET DE SOLICITANTE DE REFUGIO" },
  { value: "PTP", label: "PERMISO TEMPORAL DE PERMANENCIA" },
  { value: "CID", label: "CEDULA DE IDENTIDAD DIPLOMATICA" },
];

const newUser = ref({
  id: null,
  tipoDocumento: "DNI",
  numeroDocumento: "",
  apellidos: "",
  nombre: "",
  categoria: "AI",
  imagen: null,
});

const isLoading = ref({
  addUser: false,
  downloadExcel: false,
  uploadExcel: false,
});

const isEditing = ref(false);

const resetForm = () => {
  newUser.value = {
    tipoDocumento: "DNI",
    numeroDocumento: "",
    apellidos: "",
    nombre: "",
    categoria: "AI",
    imagen: null,
  };
  isEditing.value = false;
};

watch(() => props.userToEdit, (newValue) => {
  if (newValue) {
    newUser.value = {...newValue, categoria: newValue.categoria.replace('-', '')};
    isEditing.value = true;
  } else {
    resetForm();
  }
}, {immediate: true});

const saveUser = async () => {
  if (
      !newUser.value.numeroDocumento ||
      !newUser.value.apellidos ||
      !newUser.value.nombre
  ) {
    logError("Todos los campos son obligatorios");
    return;
  }
  isLoading.value.addUser = true;
  try {
    const userToSave = {
      ...newUser.value,
      categoria: newUser.value.categoria.replace('-', ''),
    };
    if (isEditing.value) {
      const updatedUser = await userService.updateUser(userToSave);
      logInfo("Usuario actualizado con éxito");
      emit('userUpdated', updatedUser);
    } else {
      const addedUser = await userService.addUser(userToSave);
      logInfo("Usuario agregado con éxito");
      emit('userAdded', addedUser);
    }
    resetForm();
  } catch (error) {
    logError(`Error al ${isEditing.value ? 'actualizar' : 'añadir'} usuario: ${error.message}`);
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

const categories = [
  "A-I",
  "BII-A",
  "BII-B",
  "AII-A",
  "AII-B",
  "AIII-A",
  "AIII-B",
  "AIII-C",
  "BII-C",
];

const displayCategories = computed(() => {
  return categories.map(category => ({
    value: category.replace('-', ''),
    label: category
  }));
});

const getColorClass = (color) => {
  switch (color) {
    case 'indigo':
      return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
    default:
      return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
  }
};
</script>

<template>
  <div class="flex flex-col gap-4 mb-6">
    <div class="flex justify-between items-center space-x-4">
      <div class="flex-[0.2]">
        <select
            v-model="newUser.tipoDocumento"
            class="text-sm bg-transparent border-none focus:ring-0 z-10 cursor-pointer"
        >
          <option v-for="type in documentTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        <InputField
            id="numeroDocumento"
            v-model="newUser.numeroDocumento"
            :placeholder="documentTypes.find(t => t.value === newUser.tipoDocumento)?.label"
            maxlength="20"
            :flex="1"
            type="text"
        />
      </div>
      <InputField
          id="apellidos"
          v-model="newUser.apellidos"
          label="Apellidos"
          placeholder="Apellidos"
          :flex="0.5"
          class="flex-[0.25]"
      />
      <InputField
          id="nombre"
          v-model="newUser.nombre"
          label="Nombres"
          placeholder="Nombres"
          :flex="0.25"
          class="flex-[0.25]"
      />
      <div class="flex-[0.15]">
        <label class="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
        <ImageUpload v-model="newUser.imagen" @change="handleImageUpload"/>
      </div>
      <div class="flex-[0.15]">
        <label class="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
        <select
            id="categories"
            v-model="newUser.categoria"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md h-12 px-3 cursor-pointer"
        >
          <option
              v-for="category in displayCategories"
              :key="category.value"
              :value="category.value"
          >
            {{ category.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex justify-between items-center">
      <ExcelButtons
          :is-loading="isLoading"
          @update:is-loading="(newValue) => isLoading = { ...isLoading, ...newValue }"
      />
      <div class="flex items-center gap-[16px]">
        <button
            @click="saveUser"
            :disabled="isLoading.addUser || !newUser.numeroDocumento || !newUser.apellidos || !newUser.nombre"
            :class="[
            'w-40 cursor-pointer inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 h-12',
            getColorClass('indigo'),
            { 'opacity-50 cursor-not-allowed': isLoading.addUser || !newUser.numeroDocumento || !newUser.apellidos || !newUser.nombre }
          ]"
        >
          <Loader2 v-if="isLoading.addUser" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/>
          <UserPlus v-else-if="!isEditing" class="-ml-1 mr-3 h-5 w-5"/>
          <Save v-else class="-ml-1 mr-3 h-5 w-5"/>
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
