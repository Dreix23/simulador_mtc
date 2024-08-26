<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["update:isVisible", "confirmed"]);

const closeDialog = () => {
  emit("update:isVisible", false);
};

const confirmAction = () => {
  emit("confirmed");
  closeDialog();
};
</script>

<template>
  <div v-if="isVisible" class="dialog-overlay">
    <div class="dialog-box">
      <div class="container-sub">
        <div class="dialog-header">
          <span class="text-size-14">Confirmación para finalizar examen</span>
          <button class="close-btn" @click="closeDialog">
            <span class="icon-[material-symbols--close]"></span>
          </button>
        </div>

        <div class="dialog-body">
          <p>¿Está seguro que desea finalizar el examen?</p>
        </div>
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
  width: 268px;
  height: auto;
  border: 2px solid #d0d0d0;
  overflow: hidden;
  box-shadow: 0px 0px 25.6px 0px rgba(0, 0, 0, 0.39);
}
.container-sub {
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 6px;
  padding-bottom: 21px;
  display: flex;
  flex-direction: column;
  gap: 31px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-header span {
  letter-spacing: -0.78px;
  font-style: normal;
  font-weight: 400;
}

.dialog-body p {
  color: #000;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.6px;
}

.dialog-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  justify-content: flex-end;
  background: #f0f0f0;
  padding: 9px;
}

.dialog-footer :nth-child(1) {
  width: 75px;
  height: 23px;
  background: #f0f0f0;
  border-top: 1px solid #686868;
  border-left: 1px solid #686868;
  border-right: 2px solid #686868;
  border-bottom: 2px solid #686868;

  cursor: pointer;
  font-size: 14px;
}
.dialog-footer :nth-child(2) {
  width: 75px;
  height: 23px;
  background: #f0f0f0;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-bottom: 1px solid #686868;
  border-right: 1px solid #686868;

  cursor: pointer;
  font-size: 14px;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  display: flex;
}
.close-btn span {
  font-size: 18px;
  color: #cdcdce;
}
</style>
