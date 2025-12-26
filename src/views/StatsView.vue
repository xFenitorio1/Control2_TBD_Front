<script setup>
import { ref, onMounted } from 'vue'
import { useTaskStore } from '../stores/tasks'

const taskStore = useTaskStore()

// State for analytics data
const analytics = ref({
    tasksPerSector: [],
    closestTask: null,
    topSector2km: null,
    avgDistance: '0m',
    topSector5km: null,
    avgDistanceCompleted: '0m'
})

const loading = ref(true)
const error = ref(null)

const fetchAnalytics = async () => {
    try {
        loading.value = true
        
        // 6.1 Tasks per sector
        const tasksPerSector = await taskStore.countCompletedTasksByUserAndSector()
        // Transform [sectorName, count] to object
        if (tasksPerSector) {
            analytics.value.tasksPerSector = tasksPerSector.map(item => ({
                sector: item[0],
                count: item[1]
            }))
        }

        // 6.2 Nearest pending task
        const nearestTask = await taskStore.findNearestPendingTask()
        if (nearestTask) {
            analytics.value.closestTask = {
                title: nearestTask.title,
                // Since the backend query orders by distance but doesn't return it directly in the entity,
                // we might not have the exact distance without modifying the DTO/Query. 
                // For now we'll show the sector or just 'Cercana' if distance isn't available.
                // Or if the backend strictly returns a Task entity, we use what we have.
                sector: nearestTask.sector ? nearestTask.sector.name : 'Desconocido',
                distance: 'Distancia calculada en backend' 
            }
        }

        // 6.3 Top sector in radius (2km = 2000m)
        const topSector = await taskStore.findTopSectorWithMostCompletedTasksInRadius(2000)
        if (topSector) {
             // Backend returns just the name string based on the query signature
            analytics.value.topSector2km = {
                name: topSector,
                count: 'Más frecuente' // Backend query returns name, count logic is internal to ordering
            }
        }

        // 6.3 Top sector in radius (5km = 5000m) - reusing logic for "wide area"
        const topSector5km = await taskStore.findTopSectorWithMostCompletedTasksInRadius(5000)
        if (topSector5km) {
            analytics.value.topSector5km = {
                name: topSector5km,
                count: 'Más frecuente'
            }
        }

        // 6.4 Avg distance
        const avgDist = await taskStore.calculateAverageDistanceBetweenCompletedTasksAndUser()
        if (avgDist) {
            // Round to 2 decimals and add 'm'
            analytics.value.avgDistance = `${parseFloat(avgDist).toFixed(2)}m`
        }

    } catch (err) {
        console.error('Error fetching analytics:', err)
        error.value = 'No se pudieron cargar las analíticas.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchAnalytics()
})
</script>

<template>
  <div>
    <div class="mb-6">
        <h1 class="text-h3 font-weight-bold text-gradient">Analíticas Espaciales</h1>
        <p class="text-medium-emphasis">Información de tus datos geoespaciales</p>
    </div>

    <!-- Error/Loading states -->
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <v-row v-if="!loading && !error">
        <!-- 6.1 Stats -->
        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="text-subtitle-1 text-medium-emphasis">Tareas por Sector</v-card-title>
                <v-card-text>
                    <div v-if="analytics.tasksPerSector.length === 0" class="text-caption text-medium-emphasis">No hay datos</div>
                    <div v-else v-for="item in analytics.tasksPerSector" :key="item.sector" class="mb-3">
                        <div class="d-flex justify-space-between text-body-2 mb-1">
                            <span>{{ item.sector }}</span>
                            <span class="font-weight-bold">{{ item.count }}</span>
                        </div>
                        <v-progress-linear
                            :model-value="item.count * 10" 
                            color="primary"
                            height="8"
                            rounded
                        ></v-progress-linear>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- 6.2 Nearest -->
        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                    <v-icon start color="primary">mdi-navigation</v-icon>
                    Tarea Pendiente Más Cercana
                </v-card-title>
                <v-card-text class="text-center pt-8">
                    <div v-if="analytics.closestTask">
                        <!-- Backend doesn't return distance in the Task entity, so we simplify display -->
                        <div class="text-h5 font-weight-bold mb-2">{{ analytics.closestTask.title }}</div>
                         <div class="text-caption text-medium-emphasis">en {{ analytics.closestTask.sector }}</div>
                    </div>
                    <div v-else class="text-caption text-medium-emphasis">
                        No hay tareas pendientes cercanas
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- 6.3 Radius 2km -->
        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                    <v-icon start color="secondary">mdi-target</v-icon>
                    Top Sector (Radio 2km)
                </v-card-title>
                <v-card-text class="text-center pt-8">
                    <div v-if="analytics.topSector2km">
                        <div class="text-h4 font-weight-bold text-secondary mb-2">{{ analytics.topSector2km.name }}</div>
                        <div class="text-body-2 text-medium-emphasis">
                             Sector con más actividad
                        </div>
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis">
                        Sin datos en rango
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- 6.4 Avg Distance -->
        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                    <v-icon start color="success">mdi-trending-up</v-icon>
                    Distancia Promedio
                </v-card-title>
                <v-card-text class="text-center pt-8">
                     <div class="text-h2 font-weight-bold text-success mb-2">{{ analytics.avgDistance }}</div>
                     <div class="text-caption text-medium-emphasis">
                        Entre usuario y tareas completadas
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- 6.3 Radius 5km -->
        <v-col cols="12" md="6" lg="3">
            <v-card class="h-100 bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center text-subtitle-1">
                    <v-icon start color="warning">mdi-map-marker-radius</v-icon>
                    Top Sector (Radio 5km)
                </v-card-title>
                <v-card-text class="text-center pt-8">
                    <div v-if="analytics.topSector5km">
                         <div class="text-h4 font-weight-bold text-warning mb-2">{{ analytics.topSector5km.name }}</div>
                         <div class="text-body-2 text-medium-emphasis">
                            Sector predominante en área amplia
                        </div>
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis">
                        Sin datos en rango
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
  background-clip: text;
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
