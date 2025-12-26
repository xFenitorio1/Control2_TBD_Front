<template>
  <div>
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-gradient mb-2">¡Bienvenido de nuevo, {{ auth.user?.username || 'Usuario' }}!</h1>
      <p class="text-medium-emphasis text-body-1">Aquí está el resumen de tus sectores hoy.</p>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="bg-surface-glass h-100" elevation="4">
          <v-card-text class="d-flex align-center">
            <v-avatar color="primary" rounded="lg" size="56" class="mr-4">
              <v-icon color="white" size="32">mdi-checkbox-multiple-marked-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ taskStore.pendingTasks.length }}</div>
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">Tareas Pendientes</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="bg-surface-glass h-100" elevation="4">
          <v-card-text class="d-flex align-center">
            <v-avatar color="success" rounded="lg" size="56" class="mr-4">
              <v-icon color="white" size="32">mdi-check-circle-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ taskStore.completedTasks.length }}</div>
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">Tareas Completadas</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="bg-surface-glass h-100" elevation="4">
          <v-card-text class="d-flex align-center">
            <v-avatar color="warning" rounded="lg" size="56" class="mr-4">
              <v-icon color="white" size="32">mdi-map-marker-multiple</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ sectorStore.sectors.length }}</div>
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">Sectores Activos</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="bg-surface-glass" elevation="4">
        <v-card-title class="d-flex align-center py-4">
            <v-icon start color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
            <span class="text-h6">Tareas Urgentes</span>
        </v-card-title>
        
        <v-card-text class="pb-2">
            <div v-if="taskStore.pendingTasks.length === 0" class="text-center py-8 text-medium-emphasis font-italic">
                No hay tareas pendientes. ¡Buen trabajo!
            </div>
            <v-list v-else bg-color="transparent">
                <v-list-item
                    v-for="task in taskStore.pendingTasks.slice(0, 3)" 
                    :key="task.id"
                    class="mb-2 rounded-lg bg-surface-light"
                    rounded
                >
                    <template v-slot:prepend>
                        <v-icon color="warning" icon="mdi-clock-outline"></v-icon>
                    </template>
                    
                    <v-list-item-title class="font-weight-bold">{{ task.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ task.sector?.name || task.sector }} &bull; Vence: {{ task.dueDate }}</v-list-item-subtitle>
                    
                    <template v-slot:append>
                        <v-btn variant="text" size="small" color="primary" @click="router.push('/tasks')">Ver</v-btn>
                    </template>
                </v-list-item>
            </v-list>
        </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useTaskStore } from '../stores/tasks'
import { useSectorStore } from '../stores/sectors'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const taskStore = useTaskStore()
const sectorStore = useSectorStore()
const router = useRouter()

onMounted(async () => {
    await Promise.all([
        taskStore.getAllTasks(),
        sectorStore.getAllSectors()
    ])
})
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(to right, #94a3b8, #ffffff);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-surface-glass {
  background: rgba(30, 41, 59, 0.4) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-surface-light {
    background: rgba(255, 255, 255, 0.03);
}
</style>
