import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const auth = useAuthStore()

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
                await getAllTasks()
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
                const index = tasks.value.findIndex(t => (t.id_task || t.id) === updatedTask.id)
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
            tasks.value = tasks.value.filter(t => (t.id_task || t.id) !== id)
            return true
        } catch (error) {
            console.error('Error deleting task:', error)
        }
        return false
    }

    async function toggleStatus(id) {
        const task = tasks.value.find(t => (t.id_task || t.id) === id)
        if (task) {
            return await changeStatus(id, !task.status)
        }
    }

    async function completeTask(id) {
        console.log('Completing task with ID:', id);
        try {
            const response = await api.put(`/tasks/completeTask/${id}`)
            if (response.data) {
                // Update local state
                const index = tasks.value.findIndex(t => (t.id_task || t.id) === id)
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
                const index = tasks.value.findIndex(t => (t.id_task || t.id) === id)
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
    async function getExpiringTasks() {
        const token = auth.user?.token
        console.log(token)
        if (!token) return []

        try {
            const response = await api.get('/taskAlert/getExpiringTask', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            console.log("Expiring tasks:", response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching expiring tasks:', error)
            return []
        }
    }

    async function findTasksUser() {
        const token = auth.user?.token
        console.log(token)
        if (!token) return []
        try {
            const response = await api.get('/taskAlert/UserTask', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            console.log("User tasks:", response.data)
            if (response.data) {
                tasks.value = response.data
            }
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

    async function getNotification() {
        try {
            const response = await api.get('/tasks/notificateExpiringTasks')
            return response.data
        } catch (error) {
            console.error('Error fetching notifications:', error)
            return []
        }
    }

    async function getByStatusAndKeyword(status, keyword) {
        try {
            const response = await api.get('/tasks/getByStatusAndKeyword', { params: { status, keyword } })
            return response.data
        } catch (error) {
            console.error('Error fetching tasks by status and keyword:', error)
            return []
        }
    }

    // Stats Endpoints
    async function countCompletedTasksByUserAndSector() {
        try {
            const response = await api.get('/tasks/stats/user-sector')
            return response.data
        } catch (error) {
            console.error('Error fetching user sector stats:', error)
            return []
        }
    }

    async function findNearestPendingTask() {
        try {
            const response = await api.get('/tasks/stats/nearest-pending')
            return response.data
        } catch (error) {
            console.error('Error fetching nearest pending task:', error)
            return null
        }
    }

    async function findTopSectorWithMostCompletedTasksInRadius(radius) {
        try {
            const response = await api.get('/tasks/stats/top-sector-in-radius', { params: { radius } })
            return response.data
        } catch (error) {
            console.error('Error fetching top sector stats:', error)
            return []
        }
    }

    async function calculateAverageDistanceBetweenCompletedTasksAndUser() {
        try {
            const response = await api.get('/tasks/stats/avg-distance-completed')
            return response.data
        } catch (error) {
            console.error('Error fetching average distance stats:', error)
            return null
        }
    }

    async function getWorkloadDistribution() {
        try {
            const response = await api.get('/users/workload')
            console.log(response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching workload distribution:', error)
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
        getNotification,
        getByStatusAndKeyword,
        countCompletedTasksByUserAndSector,
        getWorkloadDistribution,
        findNearestPendingTask,
        findTopSectorWithMostCompletedTasksInRadius,
        calculateAverageDistanceBetweenCompletedTasksAndUser,
        pendingTasks,
        completedTasks
    }
})
