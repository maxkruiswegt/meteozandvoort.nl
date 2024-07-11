<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header>

    </header>
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
  width: 100vw;
  gap: 3rem;
}

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
}

.content {
  width: 100%;
}

/* Media Query for Desktop Versions */
@media screen and (min-width: 769px) {
  .content {
    width: 70%;
  }
}

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {
  .app {
    gap: 0;
  }
}
</style>
