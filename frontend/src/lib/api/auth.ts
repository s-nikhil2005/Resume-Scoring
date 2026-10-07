import api from "./axios";
import type {
  User,
  RegisterResponse,
  LoginResponse,
  CurrentUserResponse,
  LogoutResponse,
} from "@/types/auth";

export async function registerUser(data: {
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<CurrentUserResponse>("/auth/me");
  return response.data.user;
}

export async function logoutUser(): Promise<LogoutResponse> {
  const response = await api.post<LogoutResponse>("/auth/logout");
  return response.data;
}