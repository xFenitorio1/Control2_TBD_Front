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
                         <div ref="mapContainer" style="width: 100%; height: 100%;"></div>
                    </v-sheet>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12">
            <v-card class="bg-surface-glass" elevation="4">
                <v-card-title class="d-flex align-center justify-space-between flex-wrap">
                    <div class="d-flex align-center mb-2 mb-sm-0">
                        <v-icon start color="info" class="mr-2">mdi-account-group</v-icon>
                        Carga de Trabajo y Ubicaciones
                    </div>
                    <div style="min-width: 250px;">
                        <v-select
                            v-model="selectedSector"
                            :items="sectorStore.sectors"
                            item-title="name"
                            item-value="name"
                            label="Filtrar por Sector"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            prepend-inner-icon="mdi-filter-variant"
                        ></v-select>
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-table class="bg-transparent" hover>
                        <thead>
                            <tr>
                                <th class="text-left text-medium-emphasis font-weight-bold">Usuario</th>
                                <th class="text-left text-medium-emphasis font-weight-bold">Sector (Ubicación)</th>
                                <th class="text-center text-medium-emphasis font-weight-bold">Tareas Completadas</th>
                                <th class="text-center text-medium-emphasis font-weight-bold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="filteredWorkload.length === 0">
                                <td colspan="4" class="text-center text-medium-emphasis py-4">
                                    {{ analytics.workloadDistribution && analytics.workloadDistribution.length > 0 ? 'No hay usuarios en este sector' : 'No hay datos disponibles' }}
                                </td>
                            </tr>
                            <tr v-else v-for="(item, index) in filteredWorkload" :key="index">
                                <td class="font-weight-medium">{{ item.userName }}</td>
                                <td class="text-medium-emphasis">{{ item.sectorName }}</td>
                                <td class="text-center">
                                    <v-chip color="info" size="small" variant="flat" class="font-weight-bold">
                                        {{ item.completedTaskCount }}
                                    </v-chip>
                                </td>
                                <td class="text-center">
                                    <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-map-search" @click="console.log('Locating user:', item.userName, 'in sector:', item.sectorName)">
                                        Ver Mapa
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { useTaskStore } from '../stores/tasks'
import { useSectorStore } from '../stores/sectors'

const taskStore = useTaskStore()
const sectorStore = useSectorStore()
const selectedSector = ref(null)

// State for analytics data
const analytics = ref({
    tasksPerSector: [],
    closestTask: null,
    topSector2km: null,
    avgDistance: '0m',
    topSector5km: null,
    avgDistanceCompleted: '0m',
    workloadDistribution: []
})

const loading = ref(true)
const error = ref(null)
const mapContainer = ref(null)
let map = null

// Computed property for filtering workload
const filteredWorkload = computed(() => {
    if (!analytics.value.workloadDistribution) return []
    if (!selectedSector.value) return analytics.value.workloadDistribution
    return analytics.value.workloadDistribution.filter(item => item.sectorName === selectedSector.value)
})

const fetchAnalytics = async () => {
    try {
        loading.value = true
        
        // Fetch sectors and ALL tasks for heatmap
        await Promise.all([
            sectorStore.getAllSectors(),
            taskStore.getAllTasks()
        ])

        // 6.1 Tasks per sector
        const tasksPerSector = await taskStore.countCompletedTasksByUserAndSector()
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
                sector: nearestTask.sector ? nearestTask.sector.name : 'Desconocido',
                distance: 'Distancia calculada en backend' 
            }
        }

        // 6.3 Top sector in radius
        const topSector = await taskStore.findTopSectorWithMostCompletedTasksInRadius(2000)
        if (topSector) {
            analytics.value.topSector2km = { name: topSector, count: 'Más frecuente' }
        }
        const topSector5km = await taskStore.findTopSectorWithMostCompletedTasksInRadius(5000)
        if (topSector5km) {
            analytics.value.topSector5km = { name: topSector5km, count: 'Más frecuente' }
        }

        // 6.4 Avg distance
        const avgDist = await taskStore.calculateAverageDistanceBetweenCompletedTasksAndUser()
        if (avgDist) analytics.value.avgDistance = `${parseFloat(avgDist).toFixed(2)}m`

        // 6.5 Workload Distribution
        const workload = await taskStore.getWorkloadDistribution()
        if (workload) analytics.value.workloadDistribution = workload

    } catch (err) {
        console.error('Error fetching analytics:', err)
        error.value = 'No se pudieron cargar las analíticas.'
    } finally {
        loading.value = false
        // Initialize map after DOM is updated and v-if="!loading" is true
        nextTick(() => {
            initMap()
        })
    }
}

const initMap = () => {
    if (!mapContainer.value) return
    
    // Cleanup if exists
    if (map) {
        map.remove()
        map = null
    }

    // Default center (Santiago approx) or first task
    const center = [-33.4489, -70.6693] 
    map = L.map(mapContainer.value).setView(center, 12)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map)

    // Heatmap data
    const heatPoints = taskStore.tasks
        .map(t => {
            // Check for lat/lng in various possible structures
            const lat = t.latitude || (t.location ? t.location.y : null)
            const lng = t.longitude || (t.location ? t.location.x : null)
            return lat && lng ? [lat, lng, 0.5] : null // 0.5 intensity
        })
        .filter(p => p !== null)

    if (heatPoints.length > 0) {
        L.heatLayer(heatPoints, { radius: 25 }).addTo(map)
        // Fit bounds if possible
        const bounds = L.latLngBounds(heatPoints.map(p => [p[0], p[1]]))
        map.fitBounds(bounds)
    }
}

onMounted(() => {
    fetchAnalytics()
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
