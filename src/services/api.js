import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istekte, localStorage'da token varsa otomatik ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 (yetkisiz) hatası gelirse kullanıcıyı login'e yönlendir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Login sayfasındaki yanlış şifre 401'i yönlendirme yapmasın, hata mesajı görünsün
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export default api;