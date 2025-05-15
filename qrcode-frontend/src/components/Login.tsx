import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error?.message || "Failed to log in";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="card shadow auth-card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">
            Sign in to your account
          </h2>

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
            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-primary">
                Sign in
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link to="/signup" className="text-decoration-none">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
