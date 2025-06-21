// src/api/index.js
import axios   from 'axios';
import Cookies from 'js-cookie';

/* ─────────── axios instances ─────────── */
const reviewAPI = axios.create({ baseURL: import.meta.env.VITE_REVIEW_API_URL });
const userAPI   = axios.create({ baseURL: import.meta.env.VITE_USER_API_URL  });
const gradeAPI  = axios.create({ baseURL: import.meta.env.VITE_GRADE_API_URL });

/* Βοηθός για τα IDs που αποθηκεύσαμε σε cookies */
const getIdentity = () => ({
  userId:        Cookies.get('userId')        || '',
  role:          Cookies.get('role')          || '',
  institutionId: Cookies.get('institutionId') || '',
});

/* ─────────── common interceptor ─────────── */
function attachInterceptors(api) {
  api.interceptors.request.use((cfg) => {
    /* 1. JWT (αν έχουμε) */
    const token = localStorage.getItem('accessToken');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;

    /* 2. ➜ Προσθέτουμε τα IDs ως query-string params */
    cfg.params = { ...cfg.params, ...getIdentity() };

    /* 3. Αν είναι POST/PUT/PATCH τα βάζουμε *επιπλέον* και στο body
          (μόνο αν το service τα χρειάζεται εκεί) */
    if (['post', 'put', 'patch'].includes(cfg.method)) {
      cfg.data = { ...cfg.data, ...getIdentity() };
    }

    return cfg;
  });
}

/* εφαρμογή σε όλα τα instances */
[reviewAPI, userAPI, gradeAPI].forEach(attachInterceptors);

/* ─────────── 401 silent-refresh μόνο στο userAPI ─────────── */
userAPI.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const rToken = localStorage.getItem('refreshToken');
      try {
        const { data } = await userAPI.post('/auth/refresh', { refreshToken: rToken });
        localStorage.setItem('accessToken', data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return userAPI.request(error.config);      // retry
      } catch {
        localStorage.clear();
        ['userId', 'role', 'institutionId'].forEach(Cookies.remove);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { reviewAPI, userAPI, gradeAPI };