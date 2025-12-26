import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useCategoryStore = defineStore('categories', () => {
    const categories = ref([])

    async function getAllCategories() {
        try {
            const response = await api.get('/categories')
            if (response.data) {
                categories.value = response.data
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    async function createCategory(category) {
        try {
            const response = await api.post('/categories', category)
            if (response.data) {
                categories.value.push(response.data)
                return true
            }
        } catch (error) {
            console.error('Error creating category:', error)
        }
        return false
    }

    async function deleteCategory(id) {
        try {
            await api.delete(`/categories/${id}`)
            categories.value = categories.value.filter(c => c.id !== id)
            return true
        } catch (error) {
            console.error('Error deleting category:', error)
        }
        return false
    }

    return {
        categories,
        getAllCategories,
        createCategory,
        deleteCategory
    }
})
