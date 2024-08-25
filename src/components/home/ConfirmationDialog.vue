<script setup>
import {defineProps, defineEmits} from 'vue';

const props = defineProps({
  isVisible: Boolean
});

const emit = defineEmits(['update:isVisible', 'confirmed']);

const closeDialog = () => {
  emit('update:isVisible', false);
};

const confirmAction = () => {
  emit('confirmed');
  closeDialog();
};
</script>

<template>
  <div v-if="isVisible" class="dialog-overlay">
    <div class="dialog-box">
      <div class="dialog-header">
        <span>Confirmación para finalizar examen</span>
        <button class="close-btn" @click="closeDialog">
          <span class="icon-[material-symbols--close] text-gray-400"></span>
        </button>
      </div>
      <div class="dialog-body">
        <p>¿Está seguro que desea finalizar el examen?</p>
      </div>
      <div class="dialog-footer">
        <button @click="confirmAction">Sí</button>
        <button @click="closeDialog">No</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-box {
  background: white;
  width: 360px;
  border: 2px solid #d0d0d0;
  overflow: hidden;
}

.dialog-header {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-body {
  padding: 10px;
  padding-bottom: 30px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background: #efefef;
}

.dialog-footer button {
  margin-left: 10px;
  padding: 2px 40px;
  background: #efefef;
  border: 1px solid #b0b0b0;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.dialog-footer button:hover {
  background: #e8e8e8;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
}
</style>