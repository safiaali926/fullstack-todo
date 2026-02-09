/**
 * Form type definitions
 */

export interface FormState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TaskFormData {
  title: string;
  description: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
