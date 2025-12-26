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
      <v-col v-for="task in filteredTasks" :key="task.id" cols="12" md="6" lg="4">
        <v-card class="h-100 bg-surface-glass-card hover-card" elevation="4">
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <v-chip
                :color="task.status === 'PENDING' ? 'warning' : 'success'"
                size="small"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ task.status === 'PENDING' ? 'PENDIENTE' : 'COMPLETADA' }}
              </v-chip>
              <div>
                <v-btn icon size="small" variant="text" @click="taskStore.toggleStatus(task.id)" :color="task.status === 'COMPLETED' ? 'success' : ''">
                    <v-icon>{{ task.status === 'COMPLETED' ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" @click="openEditModal(task)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" color="error" @click="deleteTask(task.id)">
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
                 {{ task.dueDate }}
               </div>
               <div class="d-flex align-center">
                 <v-icon start size="small">mdi-map-marker</v-icon>
                 {{ task.sector }}
               </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <v-card-title class="pa-4 bg-surface-glass">
            <span class="text-h5">{{ isEditing ? 'Editar Tarea' : 'Crear Tarea' }}</span>
        </v-card-title>
        <v-card-text class="pa-4">
            <v-form @submit.prevent="saveTask">
                <v-text-field v-model="form.title" label="Título" required variant="outlined" density="comfortable"></v-text-field>
                <v-textarea v-model="form.description" label="Descripción" rows="3" variant="outlined" density="comfortable"></v-textarea>
                
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field type="date" v-model="form.dueDate" label="Fecha de Vencimiento" variant="outlined" density="comfortable"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.sector" label="Nombre del Sector" placeholder="ej. Centro" variant="outlined" density="comfortable"></v-text-field>
                    </v-col>
                </v-row>

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
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/tasks'
import MapPicker from '../components/MapPicker.vue'

const taskStore = useTaskStore()

onMounted(() => {
    taskStore.getAllTasks()
})

const filterStatus = ref('ALL')
const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  title: '',
  description: '',
  dueDate: '',
  sector: '',
  location: null
})

const filteredTasks = computed(() => {
  return taskStore.tasks.filter(task => {
    const matchesStatus = filterStatus.value === 'ALL' || task.status === filterStatus.value
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const statusOptions = [
    { title: 'Todas', value: 'ALL' },
    { title: 'Pendientes', value: 'PENDING' },
    { title: 'Completadas', value: 'COMPLETED' }
]

function openCreateModal() {
  isEditing.value = false
  form.value = { title: '', description: '', dueDate: '', sector: '', location: null }
  showModal.value = true
}

function openEditModal(task) {
  isEditing.value = true
  editingId.value = task.id
  const { latitude, longitude, location, ...rest } = task
  
  form.value = { 
      ...rest,
      location: location || (latitude && longitude ? { lat: latitude, lng: longitude } : null)
  }
  showModal.value = true
}

async function saveTask() {
    const payload = { ...form.value }
    
    if (payload.location) {
        payload.latitude = payload.location.lat
        payload.longitude = payload.location.lng
        delete payload.location
    }

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
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(to right, #94a3b8, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-surface-glass {
  background: rgba(30, 41, 59, 0.4) !important;
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
