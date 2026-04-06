/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FiEyeOff } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useRouter, useSearchParams } from "next/navigation";
import ErrorMessage from "./ErrorMessage";
import requestClient from "@/lib/requestClient";
import { handleServerErrorMessage } from "@/utils";
import { cn } from "@/lib/utils";

interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  role: "TEEN" | "MENTOR" | "SPONSORS" | "ADMIN";
}

export default function SignupForm() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams?.get("error") ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },  
  } = useForm<IFormInput>({ mode: "onChange" });

  // Watch the role field
  const selectedUserType = watch("role");

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsLoading(true);
    try {
      const response = await requestClient().post("/auth/signup", {
        ...data,
        age: Number(data.age) || null,
      });

      if (response.status === 201) {
        router.push(
          `/auth/resend-verification?email=${encodeURIComponent(data.email)}&registered=true`
        );
        return;
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = handleServerErrorMessage(error);
      setErrorMessage(errorMessage);
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errorMessage && (
        <ErrorMessage
          error={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="flex flex-col gap-5 text-gray">
        {/* First Name Field */}
        <div className={cn("mb-5", errors.firstName?.message ? "border-error-300 focus:border-error-400" : "border-gray-300 focus:border-primary")}>
          <label htmlFor="firstName">
            First Name
            <span className="text-red-500 font-bold">
              *
            </span>
          </label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            disabled={isLoading}
            {...register("firstName", { required: "First name is required" })}
          />
          {errors.firstName && (
            <span className="text-red-500 font-bold">
              {errors.firstName?.message}
            </span>
          )}
        </div>

        {/* Last Name Field */}
        <div className={cn("mb-5", errors.lastName?.message ? "border-error-300 focus:border-error-400" : "border-gray-300 focus:border-primary")}>
          <label htmlFor="lastName">
            Last Name
            <span className="text-red-500 font-bold">
              *
            </span>
          </label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            disabled={isLoading}
            {...register("lastName", { required: "Last name is required" })}
          />
          {errors.lastName && (
            <span className="text-red-500 font-bold">
              {errors.lastName?.message}
            </span>
          )}
        </div>

        {/* Email Field */}
          <div className={cn("mb-5", errors.email?.message ? "border-error-300 focus:border-error-400" : "border-gray-300 focus:border-primary")}>
          <label htmlFor="email">
            Email
            <span className="text-red-500 font-bold">
              *
            </span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            disabled={isLoading}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <span className="text-red-500 font-bold">
              {errors.email?.message}
            </span>
          )}
        </div>

        {/* Password Field */}
          <div className={cn("mb-5", errors.password?.message ? "border-error-300 focus:border-error-400" : "border-gray-300 focus:border-primary")}>
          <label htmlFor="password">
            Password
                <span className="text-red-500 font-bold">
              *
            </span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={isVisible ? "text" : "password"}
              placeholder="Enter password"
              disabled={isLoading}
              {...register("password", { required: "Password is required" })}
            />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                disabled={isLoading}
                onClick={toggleVisibility}
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                {isVisible ? (
                  <FiEyeOff className="h-4 w-4" />
                ) : (
                  <IoEyeOutline className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {errors.password && (
            <span className="text-red-500 font-bold">
              {errors.password?.message}
            </span>
          )}
        </div>

        {/* Conditionally render Age Field if role is TEEN */}
        {selectedUserType === "TEEN" && (
          <div className={cn("mb-5", errors.age?.message ? "border-error-300 focus:border-error-400" : "border-gray-300 focus:border-primary")}>
            <label htmlFor="age">
              Age
              <span className="text-red-500 font-bold">
                *
              </span>
            </label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              disabled={isLoading}
              {...register("age", {
                required: "Age is required",
                min: { value: 13, message: "Minimum age is 13" },
                max: { value: 19, message: "Maximum age is 19" },
              })}
            />
            {errors.age && (
              <span className="text-red-500 font-bold">
                {errors.age?.message}
              </span>
            )}
          </div>
        )}

        {/* User Type Select Field */}
          <div className={cn("mb-5", errors.role?.message ? "border-error-300 focus:border-error-400" : "border-gray-300 focus:border-primary")}>
          <label htmlFor="role">
            User Type
            <span className="text-red-500 font-bold">
              *
            </span>
          </label>
          <Select
            id="role"
            placeholder="Select your role"
            disabled={isLoading}
            {...register("role", { required: "User type is required" })}
          >
            <option value="TEEN">Teen</option>
            <option value="MENTOR">Mentor</option>
            <option value="SPONSORS">Sponsors</option>
            <option value="ADMIN">Admin</option>
          </Select>
          {errors.role && (
            <span className="text-red-500 font-bold">
              {errors.role?.message}
            </span>
          )}
        </div>
      </div>
      <div className="my-6 flex flex-col gap-4">
        <Button
          variant="primary"
          size="lg"
          type="submit"
          disabled={isLoading}
        >
          Sign Up
        </Button>
      </div>
    </form>
  );
}
