import React, { useState } from "react";
import { signupStyles } from "../assets/dummyStyles";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";

const Signup = ({ API_URL = "https://expense-tracker-4gx0.onrender.com", onSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // to fetch profile
  const fetchProfile = async (token) => {
    if (!token) return null;
    const res = await axios.get(`${API_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const persistAuth = (profile, token, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    try {
      if (token) storage.setItem("token", token);
      if (profile) storage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      console.error("Storage Error:", err);
    }
  };

  //   to signup
  const onSubmit = async ({ name, email, password, rememberMe }) => {
    setApiError("");
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/user/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      const data = res.data || {};
      const token = data.token ?? null;
      let profile = data.user ?? null;
      if (!profile) {
        // check for any extra fields returned that could be user info
        const copy = { ...data };
        delete copy.token;
        delete copy.user;
        if (Object.keys(copy).length) profile = copy;
      }

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (fetchErr) {
          console.warn("Could not fetch profile after signup token:", fetchErr);
          profile = null;
        }
      }

      if (!profile) profile = { name, email };
      persistAuth(profile, token, rememberMe);
      if (typeof onSignup === "function") {
        try {
          onSignup(profile, rememberMe, token);
        } catch (callErr) {
          console.warn("onSignup threw:", callErr);
          navigate("/");
        }
      } else {
        navigate("/");
      }
      reset({ name, email, password: "", rememberMe });
    } catch (err) {
      console.error("Signup error:", err?.response || err);
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        Object.entries(serverErrors).forEach(([field, message]) => {
          if (["name", "email", "password"].includes(field)) {
            setError(field, { type: "server", message });
          }
        });
        if (!("name" in serverErrors) && !("email" in serverErrors) && !("password" in serverErrors)) {
          setApiError("Please check the highlighted fields and try again.");
        }
      } else if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signupStyles.pageContainer}>
      <div className={signupStyles.cardContainer}>
        <div className={signupStyles.header}>
          <button
            onClick={() => navigate(-1)}
            className={signupStyles.backButton}
          >
            <ArrowLeft className=" w-5 h-5" />
          </button>

          <div className={signupStyles.avatar}>
            <User className=" w-10 h-10 text-white" />
          </div>
          <h1 className={signupStyles.headerTitle}>Create Account</h1>
          <p className={signupStyles.headerSubtitle}>
            Join ExpenseTracker to manage your finances
          </p>
        </div>

        <div className={signupStyles.formContainer}>
          {apiError && <p className={signupStyles.apiError}>{apiError}</p>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className=" mb-6">
              <label htmlFor="name" className={signupStyles.label}>
                Full Name
              </label>
              <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                  <User className=" w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="name"
                  className={`${signupStyles.input} ${
                    errors.name ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="John Doe"
                  {...register("name", {
                    required: "Name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Name is required",
                  })}
                />
              </div>

              {errors.name && (
                <p className={signupStyles.fieldError}>{errors.name.message}</p>
              )}
            </div>

            <div className=" mb-6">
              <label htmlFor="email" className={signupStyles.label}>
                Email Address
              </label>
              <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                  <Mail className=" w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="email"
                  className={`${signupStyles.input} ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="your@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Email is invalid",
                    },
                  })}
                />
              </div>

              {errors.email && (
                <p className={signupStyles.fieldError}>{errors.email.message}</p>
              )}
            </div>

            <div className=" mb-6">
              <label htmlFor="password" className={signupStyles.label}>
                Password
              </label>
              <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                  <Lock className=" w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`${signupStyles.passwordInput} ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="●●●●●●"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={signupStyles.passwordToggle}
                >
                  {showPassword ? (
                    <EyeOff className=" w-5 h-5" />
                  ) : (
                    <Eye className=" w-5 h-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className={signupStyles.fieldError}>{errors.password.message}</p>
              )}
            </div>

            <div className={signupStyles.checkboxContainer}>
              <input
                type="checkbox"
                id="remember"
                className={signupStyles.checkbox}
                {...register("rememberMe")}
              />

              <label htmlFor="remember" className={signupStyles.checkboxLabel}>
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className={`${signupStyles.button} ${
                isLoading ? signupStyles.buttonDisabled : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className={signupStyles.spinner}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className={signupStyles.signInContainer}>
            <p className={signupStyles.signInText}>
              Already have an account?{" "}
              <Link to="/login" className={signupStyles.signInLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
