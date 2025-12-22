import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)
    const router = useRouter()

    function login(username, password) {
        // Mock login
        if (username && password) {
            user.value = {
                username,
                role: 'USER',
                location: null
            }
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        }
        return false
    }

    function register(username, password, location) {
        // Mock register
        console.log('Registering user:', { username, location })
        return true
    }

    function logout() {
        user.value = null
        localStorage.removeItem('user')
        router.push('/login')
    }

    return { user, login, register, logout }
})
