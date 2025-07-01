// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
    return this.request('/register', {
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
  async sendMessage(messageData) {
    return this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversation(participantId, taskId) {
    return this.request(`/api/conversations/${participantId}/${taskId}`);
  }

  async getTasks() {
    return this.request('/api/tasks');
  }

  // Legacy methods for compatibility
  async getMessages(chatId) {
    return this.request(`/api/chats/${chatId}/messages`);
  }

  async getChats() {
    return this.request('/api/chats');
  }

  // WebSocket connection for real-time chat (if needed later)
  connectWebSocket(userId) {
    const wsUrl = this.baseURL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/${userId}`);
    return ws;
  }
}

export default new ApiService();