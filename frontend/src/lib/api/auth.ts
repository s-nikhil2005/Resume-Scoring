import api from "./axios";

export async function registerUser(data: {
  email: string;
  password: string;
}) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

export async function loginUser(data: {
    email: string;
    password: string;
}){
    const response = await api.post ("/auth/login",data);

    return response.data;
}