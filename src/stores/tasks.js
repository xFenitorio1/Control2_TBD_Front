import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref([])

    async function getAllTasks() {
        try {
            const response = await api.get('/tasks/getAll')
            if (response.data) {
                tasks.value = response.data
            }
            console.log("fetching tasks", tasks.value)
        } catch (error) {
            console.error('Error fetching tasks:', error)
        }
    }

    async function createTask(task) {
        try {
            const response = await api.post('/tasks', task)
            if (response.data) {
                tasks.value.push(response.data)
                return true
            }
        } catch (error) {
            console.error('Error creating task:', error)
        }
        return false
    }

    async function updateTask(updatedTask) {
        try {
            const response = await api.put(`/tasks/${updatedTask.id}`, updatedTask)
            if (response.data) {
                const index = tasks.value.findIndex(t => t.id === updatedTask.id)
                if (index !== -1) {
                    tasks.value[index] = response.data
                }
                return true
            }
        } catch (error) {
            console.error('Error updating task:', error)
        }
        return false
    }

    async function deleteTask(id) {
        try {
            await api.put(`/tasks/delete/${id}`)
            tasks.value = tasks.value.filter(t => t.id !== id)
            return true
        } catch (error) {
            console.error('Error deleting task:', error)
        }
        return false
    }

    async function toggleStatus(id) {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            return await changeStatus(id, !task.status)
        }
    }

    async function completeTask(id) {
        try {
            const response = await api.put(`/tasks/completeTask/${id}`)
            if (response.data) {
                // Update local state
                const index = tasks.value.findIndex(t => t.id === id)
                if (index !== -1) {
                    tasks.value[index] = response.data
                }
                return true
            }
        } catch (error) {
            console.error('Error completing task:', error)
        }
        return false
    }

    async function changeStatus(id, newStatusBoolean) {
        try {

            const response = await api.put(`/tasks/status/${id}`, newStatusBoolean, {
                headers: { 'Content-Type': 'application/json' }
            })
            if (response.data) {
                const index = tasks.value.findIndex(t => t.id === id)
                if (index !== -1) {
                    tasks.value[index] = response.data
                }
                return true
            }
        } catch (error) {
            console.error('Error changing status:', error)
        }
        return false
    }

    // Alert Controller methods
    async function getExpiringTasks(criteria) {
        try {
            const response = await api.get('/taskAlert/getExpiringTask', { data: criteria })
            return response.data
        } catch (error) {
            console.error('Error fetching expiring tasks:', error)
            return []
        }
    }

    async function findTasksUser(criteria) {
        try {
            const response = await api.get('/taskAlert/UserTask', { data: criteria })
            return response.data
        } catch (error) {
            console.error('Error fetching user tasks:', error)
            return []
        }
    }

    async function findTaskActive(criteria) {
        try {
            const response = await api.get('/taskAlert/findTaskActive', { data: criteria })
            return response.data
        } catch (error) {
            console.error('Error fetching active tasks:', error)
            return []
        }
    }

    async function findTaskComplete(criteria) {
        try {
            const response = await api.get('/taskAlert/findTaskComplete', { data: criteria })
            return response.data
        } catch (error) {
            console.error('Error fetching completed tasks:', error)
            return []
        }
    }

    const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'PENDING'))
    const completedTasks = computed(() => tasks.value.filter(t => t.status === 'COMPLETED')) // Ensure backend returns string status or we map it

    return {
        tasks,
        getAllTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleStatus,
        completeTask,
        changeStatus,
        getExpiringTasks,
        findTasksUser,
        findTaskActive,
        findTaskComplete,
        pendingTasks,
        completedTasks
    }
})
