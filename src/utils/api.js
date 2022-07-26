import axios from 'axios';

import { getAuthToken } from './storage';

const baseURL = 'http://localhost:3001/api'

const api = axios.create({ baseURL });

api.interceptors.request.use(async config => {
  const token = getAuthToken();

  if (token) {
    config.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...config.headers
    }
  }

  return config
});

export default api
