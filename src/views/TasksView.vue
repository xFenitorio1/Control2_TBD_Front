<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-gradient">Tareas</h1>
        <p class="text-medium-emphasis">Gestiona tus tareas y sectores asignados</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
        Nueva Tarea
      </v-btn>
    </div>

    <v-card class="mb-6 pa-4 bg-surface-glass" elevation="0">
      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Buscar tareas..."
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filterStatus"
            :items="statusOptions"
            label="Filtrar por estado"
            prepend-inner-icon="mdi-filter"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col v-for="task in paginatedTasks" :key="task.id_task || task.id" cols="12" md="6" lg="4">
        <v-card class="h-100 bg-surface-glass-card hover-card" elevation="4">
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <v-chip
                :color="task.status === true ? 'warning' : 'success'"
                size="small"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ task.status === true ? 'PENDIENTE' : 'COMPLETADA' }}
              </v-chip>
              <div>
                <v-btn icon size="small" variant="text" @click="taskStore.toggleStatus(task.id_task || task.id)" :color="task.status === false ? 'success' : ''">
                    <v-icon>{{ task.status === false ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" @click="openEditModal(task)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" color="error" @click="deleteTask(task.id_task || task.id)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>

            <h3 class="text-h6 font-weight-bold mb-1">{{ task.title }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-4 description">{{ task.description }}</p>

            <v-divider class="mb-3"></v-divider>

            <div class="d-flex text-caption text-medium-emphasis">
               <div class="d-flex align-center mr-4">
                 <v-icon start size="small">mdi-calendar</v-icon>
                 {{ formatDate(task.expirationDate) }}
               </div>
               <div class="d-flex align-center">
                 <v-icon start size="small">mdi-map-marker</v-icon>
                 {{ task.sector?.name || task.sector }}
               </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <div class="d-flex justify-center mt-6">
        <v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="5"
            rounded="circle"
        ></v-pagination>
    </div>

    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <v-card-title class="pa-4 bg-surface-glass">
            <span class="text-h5">{{ isEditing ? 'Editar Tarea' : 'Crear Tarea' }}</span>
        </v-card-title>
        <v-card-text class="pa-4">
            <v-form @submit.prevent="submitTask">
                <v-text-field v-model="form.title" label="Título" required variant="outlined" density="comfortable"></v-text-field>
                <v-textarea v-model="form.description" label="Descripción" rows="3" variant="outlined" density="comfortable"></v-textarea>
                
                    <v-col cols="12" md="4">
                        <v-text-field type="date" v-model="form.dueDate" label="Fecha de Vencimiento" variant="outlined" density="comfortable"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="form.sectorId"
                            :items="sectorStore.sectors"
                            item-title="name"
                            item-value="id"
                            label="Sector"
                            variant="outlined"
                            density="comfortable"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="form.categoryId"
                            :items="categoryStore.categories"
                            item-title="name"
                            item-value="id"
                            label="Categoría"
                            variant="outlined"
                            density="comfortable"
                        ></v-select>
                    </v-col>

                <v-label class="mb-2 text-caption">Ubicación (Centro del Sector)</v-label>
                <v-sheet height="200" class="mb-4 rounded overflow-hidden border">
                    <MapPicker v-model="form.location" />
                </v-sheet>
                
                <div class="d-flex justify-end gap-2 mt-4">
                    <v-btn variant="text" @click="showModal = false" class="mr-2">Cancelar</v-btn>
                    <v-btn color="primary" type="submit">{{ isEditing ? 'Actualizar' : 'Crear' }}</v-btn>
                </div>
            </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTaskStore } from '../stores/tasks'
import { useAuthStore } from '../stores/auth'
import { useSectorStore } from '../stores/sectors'
import { useCategoryStore } from '../stores/categories'
import MapPicker from '../components/MapPicker.vue'

const taskStore = useTaskStore()
const auth = useAuthStore()
const sectorStore = useSectorStore()
const categoryStore = useCategoryStore()

onMounted(async () => {
    await Promise.all([
        taskStore.findTasksUser(),
        sectorStore.getAllSectors(),
        categoryStore.getAllCategories()
    ])
    console.log('Mounted TasksView. Sectors:', sectorStore.sectors);
    console.log('Mounted TasksView. Categories:', categoryStore.categories);
    console.log('Mounted TasksView. Tasks:', taskStore.tasks);
})

const filterStatus = ref('ALL')
const searchQuery = ref('')
const page = ref(1)
const itemsPerPage = 10

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  title: '',
  description: '',
  dueDate: '',
  sectorId: null,
  categoryId: null,
  location: null
})

const filteredTasks = computed(() => {
  return taskStore.tasks.filter(task => {
    const isPending = task.status === true; 
    const isCompleted = task.status === false;
    
    let matchesStatus = filterStatus.value === 'ALL';
    if (filterStatus.value === 'PENDING') matchesStatus = isPending;
    if (filterStatus.value === 'COMPLETED') matchesStatus = isCompleted;

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const paginatedTasks = computed(() => {
    const start = (page.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredTasks.value.slice(start, end)
})

const pageCount = computed(() => {
    return Math.ceil(filteredTasks.value.length / itemsPerPage)
})

// Reset page when filters change
watch([filterStatus, searchQuery], () => {
    page.value = 1
})

const statusOptions = [
    { title: 'Todas', value: 'ALL' },
    { title: 'Pendientes', value: 'PENDING' },
    { title: 'Completadas', value: 'COMPLETED' }
]

function openCreateModal() {
  isEditing.value = false
  const userLoc = auth.user?.location || null;
  form.value = { title: '', description: '', dueDate: '', sectorId: null, categoryId: null, location: userLoc }
  showModal.value = true
}

function openEditModal(task) {
  isEditing.value = true
  editingId.value = task.id_task || task.id
  
  let resolvedSectorId = null;
  if (task.sector && typeof task.sector === 'object') {
      resolvedSectorId = task.sector.id_sector || task.sector.id;
  } else if (typeof task.sector === 'number') {
      resolvedSectorId = task.sector;
  }
  
  let resolvedCategoryId = null;
  if (task.category && typeof task.category === 'object') {
      resolvedCategoryId = task.category.id_category || task.category.id;
  } else if (typeof task.category === 'number') {
      resolvedCategoryId = task.category;
  }

  let mappedDate = '';
  if (task.expirationDate) {
      mappedDate = task.expirationDate.split('T')[0];
  } else if (task.dueDate) {
      mappedDate = task.dueDate.split('T')[0];
  }

  let mappedLocation = null;
  if (task.location) {
      if (task.location.coordinates && Array.isArray(task.location.coordinates)) {
           // GeoJSON: coordinates are [longitude, latitude]
           mappedLocation = { 
               lat: task.location.coordinates[1], 
               lng: task.location.coordinates[0] 
           };
      } else if (task.location.lat && task.location.lng) {
          mappedLocation = task.location;
      }
  }

  const { latitude, longitude, location, ...rest } = task
  
  form.value = { 
      title: task.title,
      description: task.description,
      dueDate: mappedDate,
      sectorId: resolvedSectorId,
      categoryId: resolvedCategoryId,
      location: mappedLocation
  }
  showModal.value = true
}

async function submitTask() {
    console.log('submitTask called');
    
    let formattedDate = null;
    if (form.value.dueDate) {
        const now = new Date();
        const datePart = form.value.dueDate;
        
        const d = new Date(`${datePart}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`);
        
        formattedDate = d.toISOString();
    }

    let finalSectorId = form.value.sectorId;
    if (typeof finalSectorId === 'string') {
         const s = sectorStore.sectors.find(s => s.name === finalSectorId);
         finalSectorId = s ? (s.id_sector || s.id) : null;
    }

    let finalCategoryId = form.value.categoryId;
    if (typeof finalCategoryId === 'string') {
        const c = categoryStore.categories.find(c => c.name === finalCategoryId);
        finalCategoryId = c ? (c.id_category || c.id) : null;
    }

    let locationGeoJSON = null;
    let lat = null;
    let lng = null;
    
    if (form.value.location && form.value.location.lat && form.value.location.lng) {
        lat = form.value.location.lat;
        lng = form.value.location.lng;
        locationGeoJSON = {
            type: 'Point',
            coordinates: [lng, lat]
        };
    }

    const payload = {
        title: form.value.title,
        description: form.value.description,
        expirationDate: formattedDate,
        id_sector: finalSectorId,
        id_category: finalCategoryId,
        id_user: auth.user?.id || 1, 
        location: locationGeoJSON,
        latitude: lat,
        longitude: lng
    }

    console.log('Sending Payload:', payload);

    if (isEditing.value) {
        await taskStore.updateTask({ ...payload, id: editingId.value })
    } else {
        await taskStore.createTask(payload)
    }
    showModal.value = false
}

async function deleteTask(id) {
    if(confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        await taskStore.deleteTask(id)
    }
}

function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(to right, #94a3b8, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-surface-glass {
  background: rgba(30, 41, 59, 0.7) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-surface-glass-card {
  background: rgba(30, 41, 59, 0.4) !important;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.hover-card {
    transition: transform 0.2s, box-shadow 0.2s;
}

.hover-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
    border-color: rgba(139, 92, 246, 0.3);
}

.description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
