/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import Input, { type InputProps } from "@/components/ui/Input";

interface PhoneNumberInputProps extends InputProps {
  name: string;
  label: string;
  control: Control<any>;
  errors: FieldErrors<any>;
  isRequired?: boolean;
  placeholder?: string;
  validationRules?: Record<string, any>;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  name,
  label,
  control,
  errors,
  isRequired = false,
  placeholder,
  validationRules = {},
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: isRequired ? `${label} is required` : false,
        ...validationRules,
      }}
      render={({ field }) => (
        <div>
          <label
            htmlFor={name}
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            {label} {isRequired && <span className="text-error-500">*</span>}
          </label>
          <Input
            {...field}
            id={name}
            hasError={!!errors[name]}
            placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              const sanitizedValue = value.replace(/[^0-9+]/g, "");
              field.onChange(sanitizedValue);
            }}
            {...rest}
          />
          {errors[name]?.message && (
            <p className="mt-2 text-sm text-error-500">
              {errors[name]?.message?.toString()}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default PhoneNumberInput;
