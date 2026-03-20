import { useState, useEffect } from "react";
import { authAPI } from "../api/auth";

interface User {
  id: string;
  email: string;
  role: "OWNER" | "CHEF" | "CUSTOMER";
}

export const useAuth = () => {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const decodeToken =
    (token: string): User | null => {

      try {

        const payload =
          JSON.parse(
            atob(
              token.split(".")[1]
            )
          );

        return {

          id: payload.sub,

          email: payload.email,

          role: payload.role,

        };

      }
      catch {

        return null;

      }

    };

  useEffect(() => {

    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (token) {

      const decoded =
        decodeToken(token);

      if (decoded)
        setUser(decoded);

    }

  }, []);

  const login = async (
    data: {
      email: string;
      password: string;
    }
  ) => {

    try {

      setLoading(true);

      const response =
        await authAPI.login(data);

      localStorage.setItem(
        "accessToken",
        response.accessToken
      );

      const decoded =
        decodeToken(
          response.accessToken
        );

      if (decoded)
        setUser(decoded);

      return decoded;

    }
    catch (err: any) {

      setError(
        err.response?.data?.message
      );

      throw err;

    }
    finally {

      setLoading(false);

    }

  };

  const logout = () => {

    localStorage.removeItem(
      "accessToken"
    );

    setUser(null);

  };

  return {

    user,

    login,

    logout,

    loading,

    error,

    isAuthenticated: !!user,

  };

};