import axios from 'axios';

// Настраиваем определение хоста автоматически
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Если запускаем локально на 5173 порту, бэкенд ищем на 8000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api/dashboard/';
    }
    // Если проект на хостинге (Amvera), он будет слать запросы на тот же домен
    return '/api/dashboard/';
  }
  return '/api/dashboard/';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// CRM API закрыт для неавторизованных: прикладываем JWT-токен к каждому запросу.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 = токен просрочен или отозван: чистим его и отправляем на вход в CRM.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Заявки на запись, оставленные гостями через форму на сайте
export const requestService = {
  getRequests: async (params = {}) => {
    const response = await apiClient.get('requests/', { params });
    return response.data;
  },
  markProcessed: async (id) => {
    const response = await apiClient.patch(`requests/${id}/`, { status: 'processed' });
    return response.data;
  },
  deleteRequest: async (id) => {
    const response = await apiClient.delete(`requests/${id}/`);
    return response.data;
  }
};

// Секции, группы и расписание: полное управление из CRM
export const clubService = {
  getSections: async () => (await apiClient.get('sections/')).data,
  createSection: async (data) => (await apiClient.post('sections/', data)).data,
  updateSection: async (id, data) => (await apiClient.put(`sections/${id}/`, data)).data,
  deleteSection: async (id) => (await apiClient.delete(`sections/${id}/`)).data,

  getGroups: async () => (await apiClient.get('groups/')).data,
  createGroup: async (data) => (await apiClient.post('groups/', data)).data,
  updateGroup: async (id, data) => (await apiClient.put(`groups/${id}/`, data)).data,
  deleteGroup: async (id) => (await apiClient.delete(`groups/${id}/`)).data,

  getSchedules: async () => (await apiClient.get('schedules/')).data,
  createSchedule: async (data) => (await apiClient.post('schedules/', data)).data,
  updateSchedule: async (id, data) => (await apiClient.put(`schedules/${id}/`, data)).data,
  deleteSchedule: async (id) => (await apiClient.delete(`schedules/${id}/`)).data,

  getStaff: async () => (await apiClient.get('staff/')).data,
};

// Турниры (соревнования): управление из CRM
export const competitionService = {
  getCompetitions: async () => {
    const response = await apiClient.get('competitions/');
    return response.data;
  },
  createCompetition: async (data) => {
    const response = await apiClient.post('competitions/', data);
    return response.data;
  },
  updateCompetition: async (id, data) => {
    const response = await apiClient.put(`competitions/${id}/`, data);
    return response.data;
  },
  deleteCompetition: async (id) => {
    const response = await apiClient.delete(`competitions/${id}/`);
    return response.data;
  }
};

export const studentService = {
  getStats: async () => {
    const response = await apiClient.get('stats/');
    return response.data;
  },
  getStudents: async (params = {}) => {
    const response = await apiClient.get('students/', { params });
    return response.data;
  },
  createStudent: async (studentData) => {
    const response = await apiClient.post('students/', studentData);
    return response.data;
  },
  updateStudent: async (id, studentData) => {
    const response = await apiClient.put(`students/${id}/`, studentData);
    return response.data;
  },
  deleteStudent: async (id) => {
    const response = await apiClient.delete(`students/${id}/`);
    return response.data;
  }
};