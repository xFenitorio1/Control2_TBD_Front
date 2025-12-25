<script setup>
import { RouterView } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
</script>

<template>
  <v-layout>
    <AppSidebar />
    <v-main>
      <v-container fluid class="pa-6">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </v-container>
    </v-main>
  </v-layout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
