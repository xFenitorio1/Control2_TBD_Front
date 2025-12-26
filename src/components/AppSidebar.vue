<template>
  <v-navigation-drawer permanent color="surface" app>
    <template v-slot:prepend>
      <v-list-item
        lines="two"
        prepend-avatar="https://randomuser.me/api/portraits/lego/1.jpg"
        :title="auth.user?.username || 'Usuario'"
        subtitle="Conectado"
      ></v-list-item>
    </template>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item 
        v-for="item in menuItems"
        :key="item.value"
        :prepend-icon="item.icon" 
        :title="item.title" 
        :to="item.to"
        color="primary"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block color="error" variant="text" @click="handleLogout">
          <v-icon start>mdi-logout</v-icon>
          Cerrar Sesión
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>


<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const menuItems = [
  { title: 'Panel de Control', value: 'dashboard', to: '/dashboard', icon: 'mdi-view-dashboard' },
  { title: 'Tareas', value: 'tasks', to: '/tasks', icon: 'mdi-checkbox-marked-outline' },
  { title: 'Estadísticas', value: 'stats', to: '/stats', icon: 'mdi-chart-bar' }, // Updated Icon to MDI
]

function handleLogout() {
  auth.logout()
}
</script>