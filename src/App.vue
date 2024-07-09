<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <header>

  </header>
  <div class="container">
    <div class="content">
      <RouterView />
    </div>
  </div>
  <footer>

  </footer>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  overflow-y: scroll;
}

.content {
  display: flex;
  flex-direction: row;
  width: 100%;
}

/* Media Query for Desktop Versions */
@media screen and (min-width: 769px) {
  .container {
    padding-top: 3rem;

    /* Subtract the height of the navbar */
    margin-top: 82.77px;
    height: calc(100vh - 82.77px);
  }

  .content {
    width: 70%;
  }
}

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {
  .container {
    /* Subtract the height of the navbar */
    margin-bottom: 94px;
    height: calc(100vh - 94px);
  }
}
</style>
