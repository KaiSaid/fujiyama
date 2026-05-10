import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Твой базовый URL
});

// Магия перехватчика: перед каждым запросом проверяем наличие токена
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Добавляем функцию для записи (именованный экспорт)
export const enrollToSection = (sectionId) => {
    return api.post(`sections/${sectionId}/enroll/`);
};

// Единственный экспорт по умолчанию
export default api;