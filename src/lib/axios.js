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
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export default api
