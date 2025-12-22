<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  if (auth.login(username.value, password.value)) {
    router.push('/')
  } else {
    error.value = 'Credenciales inválidas'
  }
}
</script>

<template>
  <v-container class="fill-height justify-center bg-login">
    <v-card width="400" elevation="10" class="pa-4 rounded-lg bg-surface-glass">
      <v-card-title class="text-h4 font-weight-bold text-center mb-4 text-gradient">
        TaskGeo
      </v-card-title>
      <v-card-subtitle class="text-center mb-6">
        Gestión de tareas geoespaciales
      </v-card-subtitle>

      <v-card-text>
        <v-form @submit.prevent="handleLogin">
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
            Iniciar Sesión
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <span class="text-body-2 text-medium-emphasis">
          ¿No tienes una cuenta? <router-link to="/register" class="text-primary text-decoration-none font-weight-medium">Regístrate aquí</router-link>
        </span>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.bg-login {
  background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
}

.bg-surface-glass {
  background: rgba(30, 41, 59, 0.7) !important;
  backdrop-filter: blur(10px);
}

.text-gradient {
  background: linear-gradient(to right, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
