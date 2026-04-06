/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";

export function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export const handleServerErrorMessage = (errorResponse: any) => {
  if (errorResponse instanceof AxiosError) {
    const errorData = errorResponse.response?.data;

    if (Object?.keys(errorData).includes("data")) {
      return errorData.message;
    }

    if (typeof errorData === "string") return errorData;

    if (Object.keys(errorData).includes("errors")) {
      const errors = errorData.errors as Record<string, string[]>[];
      return Object.values(errors)[0][0];
    }

    if (Object.keys(errorData).includes("error")) return errorData.error;

    return errorData.message;
  }
  return "Unhandled Exception: Contact the administrator";
};

export const convertLetterCase = (text: string) => {
  if (!text) return text;

  if (text.includes(" ")) {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const camelCaseToTitleCase = (str: string) => {
  const result = str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return result;
};

export const formatFirstLetterCaps = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
