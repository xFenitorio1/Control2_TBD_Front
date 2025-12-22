import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref([
        {
            id: 1,
            title: 'Fix Traffic Light',
            description: 'Traffic light at Main St stuck on red.',
            status: 'PENDING',
            dueDate: '2025-12-25',
            sector: 'Traffic Control',
            location: { lat: -33.4569, lng: -70.6483 }
        },
        {
            id: 2,
            title: 'Park Maintenance',
            description: 'Clean up sector 4 in Central Park.',
            status: 'COMPLETED',
            dueDate: '2025-12-20',
            sector: 'Parks',
            location: { lat: -33.4600, lng: -70.6500 }
        }
    ])

    function addTask(task) {
        const newTask = {
            ...task,
            id: Date.now(),
            status: 'PENDING'
        }
        tasks.value.push(newTask)
    }

    function updateTask(updatedTask) {
        const index = tasks.value.findIndex(t => t.id === updatedTask.id)
        if (index !== -1) {
            tasks.value[index] = updatedTask
        }
    }

    function deleteTask(id) {
        tasks.value = tasks.value.filter(t => t.id !== id)
    }

    function toggleStatus(id) {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            task.status = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
        }
    }

    const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'PENDING'))
    const completedTasks = computed(() => tasks.value.filter(t => t.status === 'COMPLETED'))

    return { tasks, addTask, updateTask, deleteTask, toggleStatus, pendingTasks, completedTasks }
})
