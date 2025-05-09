import axios from 'axios';
import io from 'socket.io-client';

// Create axios instance
const API_URL = 'http://localhost:12001';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create socket.io instance
export const socket = io(API_URL);

// Socket event listeners
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

// API functions
export const getConfig = async () => {
  try {
    const response = await api.get('/api/config');
    return response.data;
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
};

export const createProject = async (prompt: string, llmType: string, apiKeys?: any) => {
  try {
    const response = await api.post('/api/projects', {
      prompt,
      llm_type: llmType,
      api_keys: apiKeys,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getProject = async (projectId: string) => {
  try {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
};

export const listProjects = async () => {
  try {
    const response = await api.get('/api/projects');
    return response.data.projects;
  } catch (error) {
    console.error('Error listing projects:', error);
    throw error;
  }
};

// API key management
export const saveApiKeys = (keys: { 
  openai?: string; 
  xai?: string; 
  gemini?: string;
}) => {
  localStorage.setItem('metagpt_api_keys', JSON.stringify(keys));
};

export const getApiKeys = () => {
  const keys = localStorage.getItem('metagpt_api_keys');
  return keys ? JSON.parse(keys) : {};
};

export const clearApiKeys = () => {
  localStorage.removeItem('metagpt_api_keys');
};

export default {
  getConfig,
  createProject,
  getProject,
  listProjects,
  saveApiKeys,
  getApiKeys,
  clearApiKeys,
  socket,
};