import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useSectorStore = defineStore('sectors', () => {
    const sectors = ref([])

    async function getAllSectors() {
        try {
            const response = await api.get('/sectors')
            if (response.data) {
                sectors.value = response.data
            }
        } catch (error) {
            console.error('Error fetching sectors:', error)
        }
    }

    async function createSector(sector) {
        try {
            const response = await api.post('/sectors', sector)
            if (response.data) {
                sectors.value.push(response.data)
                return true
            }
        } catch (error) {
            console.error('Error creating sector:', error)
        }
        return false
    }

    async function deleteSector(id) {
        try {
            await api.delete(`/sectors/${id}`)
            sectors.value = sectors.value.filter(s => s.id !== id)
            return true
        } catch (error) {
            console.error('Error deleting sector:', error)
        }
        return false
    }

    return {
        sectors,
        getAllSectors,
        createSector,
        deleteSector
    }
})
