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

  // Responsive form container
  const formContainerClass =
    "flex flex-col items-center justify-center w-full p-5 gap-4 md:gap-5";
    
  // Responsive input with larger width on laptop
  const inputBaseClass =
    "appearance-none bg-[#A7B5E7] w-full max-w-sm px-3 py-2 md:py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base placeholder-[#E0E7FF]";
    
  const inputErrorBorderClass = "border border-red-300";
  const inputNormalBorderClass = "border border-[#7895FC]";
  
  // Responsive button with better sizing for laptop
  const submitButtonClass = `w-full max-w-[160px] md:max-w-[180px] flex justify-center py-2 px-4 md:py-2.5 md:px-5 rounded-full text-sm md:text-base font-medium text-white ${
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
      <div className="w-full max-w-sm">
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

      <div className="w-full max-w-sm">
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
        <div className="p-2 text-sm md:text-base bg-red-100 text-red-700 rounded-md w-full max-w-sm">
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

      <Link to="/register">
        <div className="text-sm md:text-base text-gray-500 mt-2">
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