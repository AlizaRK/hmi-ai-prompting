// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'https://hmi-ai-prompting.onrender.com/';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Chat methods
  async getMessages(chatId) {
    return this.request(`/api/chats/${chatId}/messages`);
  }

  async sendMessage(chatId, message) {
    return this.request(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async getChats() {
    return this.request('/api/chats');
  }

  // WebSocket connection for real-time chat
  connectWebSocket(userId) {
    const wsUrl = this.baseURL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/${userId}`);
    return ws;
  }
}

export default new ApiService();