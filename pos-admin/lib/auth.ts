import { api, endpoints } from "@/lib/api";

export async function getMe() {
  const res: any = await api(endpoints.auth.me);
  return res.data.user;
}
