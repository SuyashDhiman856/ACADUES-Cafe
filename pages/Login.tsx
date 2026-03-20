import React, { useState } from "react";
import {
  Mail,
  Lock,
  RefreshCw,
  Utensils,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { StaffMember, UserRole } from "../types";

interface LoginProps {
  onLogin: (user: StaffMember) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {

  const { login, loading, error } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  /////////////////////////////////////////////////////////////
  // Permissions helper
  /////////////////////////////////////////////////////////////

  const getPermissionsForRole = (
    role: UserRole
  ): string[] => {

    switch (role) {

      case UserRole.OWNER:
        return [
          "dashboard",
          "kitchen",
          "orders",
          "menu",
          "expenses",
          "customers",
          "analytics",
          "settings",
          "finance",
        ];

      case UserRole.CHEF:
        return ["kitchen", "orders"];

      case UserRole.CUSTOMER:
        return ["self-order"];

      default:
        return [];

    }

  };

  /////////////////////////////////////////////////////////////
  // Handle login
  /////////////////////////////////////////////////////////////

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      const loggedUser =
        await login({
          email: email.trim(),
          password,
        });

      if (!loggedUser)
        return;

      const staffMember: StaffMember = {

        id: loggedUser.id,

        name:
          loggedUser.email.split("@")[0],

        email:
          loggedUser.email,

        phone: "",

        role:
          loggedUser.role as UserRole,

        permissions:
          getPermissionsForRole(
            loggedUser.role as UserRole
          ),

        tenantId:
          "resto_track_default",

        createdAt:
          new Date().toISOString(),

      };

      onLogin(staffMember);

    }
    catch (err) {

      console.error(
        "Login failed",
        err
      );

    }

  };

  /////////////////////////////////////////////////////////////

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-6">

      <div className="w-full max-w-md space-y-10">

        {/* Logo */}
        <div className="text-center space-y-4">

          <div className="w-20 h-20 bg-[#D17842] rounded-[28px] flex items-center justify-center text-white mx-auto shadow-xl">

            <Utensils size={40} />

          </div>

          <h1 className="text-4xl font-black">
            RestoTrack
          </h1>

          <p className="text-gray-500">
            Management Portal Login
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-xl space-y-6"
        >

          {error && (

            <div className="text-red-500 text-sm text-center">
              {error}
            </div>

          )}

          {/* Email */}

          <div>

            <label className="font-bold">
              Email
            </label>

            <div className="relative">

              <Mail
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="w-full pl-10 p-3 border rounded-xl"
              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="font-bold">
              Password
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-3 text-gray-400" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="w-full pl-10 pr-10 p-3 border rounded-xl"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-3"
              >

                {showPassword
                  ? <EyeOff />
                  : <Eye />}

              </button>

            </div>

          </div>

          {/* Button */}

          <button
            disabled={loading}
            className="w-full bg-[#D17842] text-white p-3 rounded-xl font-bold flex justify-center"
          >

            {loading
              ? <RefreshCw className="animate-spin"/>
              : "Login"}

          </button>

        </form>

      </div>

    </div>

  );

};

export default Login;