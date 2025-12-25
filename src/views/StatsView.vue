<script setup>
import { ref } from 'vue'

// Mock Data answering the questions
const analytics = ref({
    tasksPerSector: [
        { sector: 'Control de Tráfico', count: 12 },
        { sector: 'Parques', count: 8 },
        { sector: 'Calles', count: 5 }
    ],
    closestTask: {
        title: 'Reparar Bache',
        distance: '450m',
        sector: 'Calles'
    },
    topSector2km: {
        name: 'Control de Tráfico',
        count: 5
    },
    avgDistance: '1.2km',
    topSector5km: {
        name: 'Parques',
        count: 15
    },
    avgDistanceCompleted: '0.8km'
})
</script>

<template>
  <div>
    <div class="mb-6">
        <h1 class="text-h3 font-weight-bold text-gradient">Analíticas Espaciales</h1>
        <p class="text-medium-emphasis">Información de tus datos geoespaciales</p>
    </div>

    <v-row>
        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="text-subtitle-1 text-medium-emphasis">Tareas por Sector</v-card-title>
                <v-card-text>
                    <div v-for="item in analytics.tasksPerSector" :key="item.sector" class="mb-3">
                        <div class="d-flex justify-space-between text-body-2 mb-1">
                            <span>{{ item.sector }}</span>
                            <span class="font-weight-bold">{{ item.count }}</span>
                        </div>
                        <v-progress-linear
                            :model-value="item.count * 5"
                            color="primary"
                            height="8"
                            rounded
                        ></v-progress-linear>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                    <v-icon start color="primary">mdi-navigation</v-icon>
                    Tarea Pendiente Más Cercana
                </v-card-title>
                <v-card-text class="text-center pt-8">
                    <div class="text-h2 font-weight-bold mb-2">{{ analytics.closestTask.distance }}</div>
                    <div class="text-body-1 font-weight-medium">"{{ analytics.closestTask.title }}"</div>
                    <div class="text-caption text-medium-emphasis">en {{ analytics.closestTask.sector }}</div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                    <v-icon start color="secondary">mdi-target</v-icon>
                    Top Sector (Radio 2km)
                </v-card-title>
                <v-card-text class="text-center pt-8">
                    <div class="text-h4 font-weight-bold text-secondary mb-2">{{ analytics.topSector2km.name }}</div>
                    <div class="text-body-2 text-medium-emphasis">
                        {{ analytics.topSector2km.count }} tareas completadas cerca
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                     <v-icon start color="success">mdi-trending-up</v-icon>
                     Distancia Promedio
                </v-card-title>
                <v-card-text class="text-center pt-8">
                     <div class="text-h2 font-weight-bold text-success mb-2">{{ analytics.avgDistance }}</div>
                     <div class="text-caption text-medium-emphasis">
                        Desde tu ubicación registrada a tareas completadas
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                     <v-icon start color="warning">mdi-map-marker-radius</v-icon>
                     Top Sector (Radio 5km)
                </v-card-title>
                <v-card-text class="text-center pt-8">
                     <div class="text-h4 font-weight-bold text-warning mb-2">{{ analytics.topSector5km.name }}</div>
                     <div class="text-body-2 text-medium-emphasis">
                        {{ analytics.topSector5km.count }} tareas en área amplia
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="9">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title>Mapa de Calor de Tareas</v-card-title>
                <v-card-subtitle>Concentración de tareas pendientes (Simulado)</v-card-subtitle>
                <v-card-text>
                    <v-sheet height="300" class="position-relative rounded overflow-hidden border bg-blue-grey-darken-4 mt-2">
                        <div class="map-grid"></div>
                        <!-- Simuladores -->
                        <div class="cluster c1 bg-primary elevation-10" style="top: 30%; left: 40%;">12</div>
                        <div class="cluster c2 bg-primary elevation-10" style="top: 60%; left: 70%;">8</div>
                        <div class="cluster c3 bg-primary elevation-10" style="top: 20%; left: 80%;">5</div>
                    </v-sheet>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.text-gradient {
  background: linear-gradient(to right, #94a3b8, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-surface-glass {
  background: rgba(30, 41, 59, 0.4) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.map-grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#374151 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.5;
}

.cluster {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
}
</style>
