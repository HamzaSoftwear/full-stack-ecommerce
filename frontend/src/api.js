// export const API_URL = "http://localhost:5000/api/v1";

export const API_URL = import.meta.env.VITE_API_URL;

export function saveAuth({ token, user }) {
  if (!token || !user) return;

  localStorage.setItem("token", token);
  localStorage.setItem("userId", user.id);
  localStorage.setItem("isAdmin", user.isAdmin ? "true" : "false");

  if (user.email) {
    localStorage.setItem("userEmail", user.email);
  } else {
    localStorage.removeItem("userEmail");
  }

  // 👇 تحسين اختياري لعرض الاسم في الهيدر
  if (user.username) {
    localStorage.setItem("username", user.username);
  } else {
    localStorage.removeItem("username");
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Include more error details in the error message
    const errorMessage = data.details || data.message || data.error || "Request failed";
    const error = new Error(errorMessage);
    error.details = data.details;
    error.fullError = data;
    throw error;
  }

  return data;
}

export async function uploadImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers,
    body: formData
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage = data.message || data.error || "Upload failed";
    throw new Error(errorMessage);
  }

  // Return full URL
  // return `http://localhost:5000${data.file.url}`;

  return data.file.url;

}
