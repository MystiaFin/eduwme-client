import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { login } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const formContainerClass =
    "flex flex-col items-center justify-center w-86 p-5 gap-5";
  const inputBaseClass =
    "appearance-none bg-[#A7B5E7] w-64 px-3 py-2 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-[#E0E7FF]";
  const inputErrorBorderClass = "border border-red-300";
  const inputNormalBorderClass = "border border-[#7895FC]";
  const submitButtonClass = `w-26 flex justify-center py-2 px-4 rounded-full text-sm font-medium text-white ${
    isSubmitting
      ? "bg-[#303442] cursor-not-allowed"
      : "bg-[#303442] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#303442]"
  }`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Then update auth context with the login info
      await login(formData.username, formData.password);

      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={formContainerClass} onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className={`${inputBaseClass} ${
            errors.username ? inputErrorBorderClass : inputNormalBorderClass
          }`}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={`${inputBaseClass} ${
            errors.password ? inputErrorBorderClass : inputNormalBorderClass
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {submitError && (
        <div className="p-2 text-sm bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={submitButtonClass}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <Link to="/register" className="text-sm text-blue-500">
      <div className="text-sm text-gray-500">
        Don't have an account?{" "}
        <span className="text-amber-300 hover:underline">
          Register
        </span>
       </div>
      </Link> 
    </form>
  );
};

export default Login;
