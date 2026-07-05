import axios from 'axios';

// Локально бэкенд живёт на 8000-м порту, на хостинге — на том же домене.
const getBaseURL = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000/api/';
    }
    return '/api/';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Перед каждым запросом прикладываем токен, если он есть
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Просроченный/невалидный токен даёт 401 даже на публичных эндпоинтах
// (аутентификация выполняется раньше проверки прав). Лечимся сами:
// убираем битый токен и повторяем запрос один раз анонимно.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const config = error.config;
        const hadToken = config?.headers?.Authorization;
        if (error.response?.status === 401 && hadToken && !config._retried) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token');
            config._retried = true;
            delete config.headers.Authorization;
            return api(config);
        }
        return Promise.reject(error);
    }
);

// Добавляем функцию для записи (именованный экспорт)
export const enrollToSection = (sectionId) => {
    return api.post(`sections/${sectionId}/enroll/`);
};

// Единственный экспорт по умолчанию
export default api;