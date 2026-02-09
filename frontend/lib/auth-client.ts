/**
 * Authentication Client
 * Custom auth utilities that call backend API endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

interface SignInParams {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface AuthError {
  message: string;
}

/**
 * Set cookie helper function
 */
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Delete cookie helper function
 */
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Sign up a new user
 */
export const signUp = {
  email: async (params: SignUpParams): Promise<{ data?: AuthResponse; error?: AuthError }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.detail || "Signup failed",
          },
        };
      }

      // Store token in both localStorage and cookie
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setCookie("auth_token", data.token, 7);
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  },
};

/**
 * Sign in an existing user
 */
export const signIn = {
  email: async (params: SignInParams): Promise<{ data?: AuthResponse; error?: AuthError }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.detail || "Signin failed",
          },
        };
      }

      // Store token in both localStorage and cookie
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setCookie("auth_token", data.token, 7);
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  },
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  deleteCookie("auth_token");
};

/**
 * Get current session
 */
export const getSession = (): { user: AuthResponse["user"]; token: string } | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return { user, token };
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

/**
 * Get auth token for API requests
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

/**
 * React hook for session (simplified version)
 */
export const useSession = () => {
  // This is a simplified version - in production you'd want to use React state
  const session = getSession();
  return {
    data: session,
    isPending: false,
  };
};
