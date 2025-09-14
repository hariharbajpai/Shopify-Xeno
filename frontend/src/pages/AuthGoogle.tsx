// src/pages/AuthGoogle.tsx
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGoogle() {
  const { setUserFromIdToken, debugForceLogin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid place-items-center bg-black text-white">
      <div className="w-full max-w-sm p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <h1 className="text-2xl mb-4 font-semibold">Sign in</h1>
        <p className="opacity-70 mb-6 text-sm">
          Frontend-only demo sign-in. No backend calls.
        </p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(cred) => {
              const idToken = cred.credential!;
              setUserFromIdToken(idToken);
              navigate("/dashboard", { replace: true });
            }}
            onError={() => {
              // fallback: still allow entry for demo
              debugForceLogin();
              navigate("/dashboard", { replace: true });
            }}
            useOneTap
          />
        </div>

        <button
          onClick={() => {
            debugForceLogin();
            navigate("/dashboard", { replace: true });
          }}
          className="mt-6 w-full py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
        >
          Continue without Google (demo)
        </button>

        <p className="mt-4 text-xs opacity-60">
          Do not use this flow in production.
        </p>
      </div>
    </div>
  );
}
