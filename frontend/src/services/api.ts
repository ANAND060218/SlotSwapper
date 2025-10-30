import axios from 'axios'

// Get the production API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({ 
  baseURL: API_URL || 'http://localhost:5000/api' 
})

export default api
