import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)
    const router = useRouter()

    async function login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password })
            if (response.data && response.data.token) {
                user.value = {
                    token: response.data.token,
                    email: email,
                }
                localStorage.setItem('user', JSON.stringify(user.value))
                return true
            }
            return false
        } catch (error) {
            console.error('Login failed:', error)
            return false
        }
    }

    async function register(username, password, email, latitude, longitude) {
        try {
            const response = await api.post('/auth/register', {
                username,
                password,
                email,
                latitude,
                longitude
            })

            if (response.data && response.data.token) {
                user.value = {
                    token: response.data.token,
                    username: username,
                    email: email,
                    location: { lat: latitude, lng: longitude }
                }
                localStorage.setItem('user', JSON.stringify(user.value))
                return true
            }
            return false
        } catch (error) {
            console.error('Registration failed:', error)
            return false
        }
    }

    function logout() {
        user.value = null
        localStorage.removeItem('user')
        router.push('/login')
    }

    return { user, login, register, logout }
})
