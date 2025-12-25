<template>
  <v-container class="fill-height justify-center bg-login">
    <v-card width="500" elevation="10" class="pa-4 rounded-lg bg-surface-glass">
      <v-card-title class="text-h4 font-weight-bold text-center mb-2 text-gradient">
        Únete a TaskGeo
      </v-card-title>
      <v-card-subtitle class="text-center mb-6">
        Regístrate para comenzar
      </v-card-subtitle>

      <v-card-text>
        <v-form @submit.prevent="handleRegister">
          <v-text-field
            v-model="username"
            label="Usuario"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            density="comfortable"
            class="mb-2"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Contraseña"
            type="password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          ></v-text-field>

          <v-label class="mb-2 text-caption font-weight-medium">Tu Ubicación (Haz click en el mapa)</v-label>
          <v-sheet height="250" class="mb-2 rounded overflow-hidden border">
             <MapPicker v-model="location" />
          </v-sheet>
          
          <div v-if="location" class="text-caption text-secondary mb-4 d-flex align-center">
            <v-icon size="small" start>mdi-map-marker</v-icon>
            Seleccionado: {{ location.lat.toFixed(4) }}, {{ location.lng.toFixed(4) }}
          </div>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ error }}
          </v-alert>

          <v-btn
            block
            color="primary"
            size="large"
            type="submit"
            class="mb-4"
          >
            Registrarse
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <span class="text-body-2 text-medium-emphasis">
          ¿Ya tienes cuenta? <router-link to="/login" class="text-primary text-decoration-none font-weight-medium">Inicia Sesión aquí</router-link>
        </span>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import MapPicker from '../components/MapPicker.vue'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const location = ref(null)
const error = ref('')

function handleRegister() {
  if (!location.value) {
      error.value = "Por favor selecciona tu ubicación en el mapa"
      return
  }
  
  if (auth.register(username.value, password.value, location.value)) {
    router.push('/login')
  } else {
    error.value = 'Error en el registro'
  }
}
</script>

<style scoped>
.bg-login {
  background: radial-gradient(circle at bottom left, #1e1b4b, #0f172a);
}

.bg-surface-glass {
  background: rgba(30, 41, 59, 0.7) !important;
  backdrop-filter: blur(10px);
}

.text-gradient {
  background: linear-gradient(to right, #06b6d4, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
