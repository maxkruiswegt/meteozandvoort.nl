<script setup>
import { RouterView } from 'vue-router';
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
  height: 100vh;
  height: 100lvh;
  width: 100vw;
  width: 100dvw;
  position: relative;
  z-index: 0;
  background: url('/img/background.webp') no-repeat center/cover;
  background-color: rgba(30, 30, 35, 0.75);
  background-blend-mode: overlay;
  overflow-y: scroll;
}
</style>
