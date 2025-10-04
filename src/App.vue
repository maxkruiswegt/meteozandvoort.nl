<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { observeElements } from '@/utils/observerUtils';

onMounted(() => {
  // Observe elements for animations
  observeElements();
});
</script>

<template>
  <div class="app-wrapper">
    <RouterView />
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100lvh;
  max-width: 100vw;
  max-width: 100dvw;
  position: relative;
  overflow-x: hidden;
  background: url('/img/background.webp') no-repeat center/cover;
  background-color: rgba(30, 30, 35, 0.75);
  background-blend-mode: overlay;
  background-attachment: fixed;
}
</style>
