import axios from 'axios'
import { getItem } from './secureStorage'

const api = axios.create({
  baseURL: 'https://foodstore-server-nu.vercel.app',
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const token = await getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // hapus params yang undefined supaya tidak ikut terkirim
  if (config.params) {
    Object.keys(config.params).forEach((key) => {
      if (config.params[key] === undefined) delete config.params[key]
    })
  }

  console.log(`[API →] ${config.method?.toUpperCase()} ${config.url}`, config.params ?? '')
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log(`[API ←] ${response.status} ${response.config.url}`, response.data)
    if (response.data?.error === 1) {
      return Promise.reject({ response, isAppError: true })
    }
    return response
  },
  (error) => {
    console.error(`[API ✗] ${error.response?.status} ${error.config?.url}`, error.response?.data ?? error.message)
    return Promise.reject(error)
  }
)

export default api
