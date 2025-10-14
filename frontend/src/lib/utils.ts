import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCookie(name: string) {
  return Cookies.get(name);
}

const cookieOptions: Cookies.CookieAttributes = {
  expires: new Date(Date.now() + 1000 * 60 * 15), // 15 mins
  path: "/",
  sameSite: "Lax",
};

export function setCookie(name: string, value: string) {
  return Cookies.set(name, value, cookieOptions);
}

export function removeCookies(...names: string[]) {
  for (const name in names) Cookies.remove(name, cookieOptions);
}
