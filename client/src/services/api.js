
const API_URL = "http://10.18.17.77:5000";
// const API_URL = "http://192.168.1.182:5000";
import { getToken } from "./auth";

export const healthCheck = async () => {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
};

export const signup = async (userData) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};


export const login = async (userData) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const logout = async (token) => {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
};


export const createPost = async (postData, token) => {
  const response = await fetch(`${API_URL}/api/posts/create-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Create post failed");
  }

  return data;
};

export const getPosts = async () => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return await response.json();
};

export const getPostById = async (postId) => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch post");
  }

  return data;
};

export const updatePost = async (postId, postData) => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update post");
  }

  return data;
};

export const createBarter = async (postId, message) => {
  const token = await getToken();

  const response = await fetch(
    `${API_URL}/api/posts/${postId}/barters`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create barter");
  }

  return data;
};

export const getMyBartersForPost = async (postId) => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/posts/${postId}/barters/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch barters");
  }

  return data;
};

export const getMyBarters = async () => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/barters/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch barters");
  }

  return data;
};

export const acceptBarter = async (barterId) => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/barters/${barterId}/accept`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to accept barter");
  }

  return data;
};

export const getMessages = async (barterId) => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/barters/${barterId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch messages");
  }

  return data;
};

export const sendMessage = async (barterId, text) => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/barters/${barterId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send message");
  }

  return data;
};

export const rejectBarter = async (barterId) => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/barters/${barterId}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reject barter");
  }

  return data;
};