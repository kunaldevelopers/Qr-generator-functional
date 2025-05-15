import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      await signup(email, password);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error?.message || "Failed to create an account";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="card shadow auth-card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Create an account</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-primary">
                Sign up
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
