import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthModal({
  onClose,
  onAuth,
}: {
  onClose: () => void;
  onAuth?: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let result;
    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      onAuth?.();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <button
              className="absolute top-2 right-2 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 z-10"
              onClick={onClose}
              aria-label="Close auth modal"
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {mode === "login" ? "Sign In" : "Register"}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 text-white"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/20 text-white"
              />
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : mode === "login"
                  ? "Sign In"
                  : "Register"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                className="text-blue-300 underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login"
                  ? "Don't have an account? Register"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
