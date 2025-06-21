import axios from 'axios';

const API_URL = 'http://localhost:8080/api/user';

export async function loginWithCredentials(email, password) {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data; // { token, user }
}

export async function loginWithGoogleToken(id_token) {
  const response = await axios.post(`${API_URL}/google-login`, { id_token });
  return response.data; // { token, user }
}
