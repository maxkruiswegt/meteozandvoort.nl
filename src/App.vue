<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <div class="container">
      <div class="content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100lvh;
  width: 100vw;
  gap: 3rem;
  background: url('/img/background.webp') no-repeat center/cover;
  position: relative;
}

/* Adds a semi-transparent overlay to the background image */
.app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
  z-index: 2;
}

.content {
  width: 100%;
}

/* Media Query for Desktop Versions */
@media screen and (min-width: 769px) {
  .content {
    width: 70%;
    margin-top: 3rem;
    margin-bottom: 1rem;
  }
}

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {
  .app {
    gap: 0;
  }
}
</style>
