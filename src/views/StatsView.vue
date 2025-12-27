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
                <v-card-subtitle>Concentración de tareas</v-card-subtitle>
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
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="filteredWorkload.length === 0">
                                <td colspan="3" class="text-center text-medium-emphasis py-4">
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

const heatmapData = ref([])

const fetchAnalytics = async () => {
    try {
        loading.value = true
        
        const [_, pendingTasks] = await Promise.all([
            sectorStore.getAllSectors(),
            taskStore.getPendingTasksBySector()
        ])
        
        if (pendingTasks) {
            heatmapData.value = pendingTasks
        }

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
        nextTick(() => {
            initMap()
        })
    }
}

const initMap = () => {
    if (!mapContainer.value) return
      
    if (map) {
        map.remove()
        map = null
    }

    // Default center
    const center = [-33.4489, -70.6693] 
    map = L.map(mapContainer.value).setView(center, 12)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map)

    const heatPoints = []
    
    console.log('StatsView: Initializing Heatmap');
    console.log('Heatmap Data (Pending Tasks):', JSON.parse(JSON.stringify(heatmapData.value)));
    console.log('Sectors Available:', JSON.parse(JSON.stringify(sectorStore.sectors)));

    heatmapData.value.forEach(item => {
        const normalizedItemName = item.name_sector.trim();
        const sector = sectorStore.sectors.find(s => s.name.trim() === normalizedItemName)
        
        if (sector) {
            let location = sector.area || sector.location;

            if (typeof location === 'string') {
                try {
                    location = JSON.parse(location);
                } catch (e) {
                    console.error(`StatsView: Failed to parse location/area for sector ${sector.name}`, e);
                    return;
                }
            }

            if (location) {
                let lat, lng;
                
                if (location.type === 'Point' && Array.isArray(location.coordinates)) {
                    lng = location.coordinates[0];
                    lat = location.coordinates[1];
                } else if (location.type === 'Polygon' && Array.isArray(location.coordinates)) {
                    const ring = location.coordinates[0];
                    if (ring && ring.length > 0) {
                        let sumLat = 0, sumLng = 0;
                        ring.forEach(coord => {
                            sumLng += coord[0];
                            sumLat += coord[1];
                        });
                        lat = sumLat / ring.length;
                        lng = sumLng / ring.length;
                    }
                } else if (location.lat && location.lng) {
                    lat = location.lat;
                    lng = location.lng;
                } else if (sector.latitude && sector.longitude) {
                     lat = sector.latitude
                     lng = sector.longitude
                }

                if (lat && lng) {
                     const intensity = Math.min(item.pending_tasks / 20, 5.0); 
                     heatPoints.push([lat, lng, intensity]);
                }
            }
        }
    })

    if (heatPoints.length > 0) {
        L.heatLayer(heatPoints, { radius: 25 }).addTo(map)
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
