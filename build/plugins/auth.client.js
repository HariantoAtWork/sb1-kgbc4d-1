import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  // Initialize the auth store from local storage
  authStore.initializeFromStorage()
  
  // Add a global HTTP interceptor for adding the token to requests
  const { $fetch } = useNuxtApp()
  $fetch.create({
    onRequest({ options }) {
      if (authStore.token) {
        options.headers = options.headers || {}
        options.headers['Authorization'] = `Bearer ${authStore.token}`
      }
    },
  })
})