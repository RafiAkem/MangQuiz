import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  player_name: string;
  score: number;
  accuracy?: number;
  category?: string;
  created_at: string;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);
      if (!error && data) setEntries(data);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Leaderboard
          </h3>
          <Badge variant="outline" className="border-blue-400 text-blue-300">
            Top 10
          </Badge>
        </div>
        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="space-y-4">
            {entries.length === 0 && (
              <div className="text-white">No scores yet.</div>
            )}
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg transition-all duration-300 ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-400 text-black"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {entry.player_name}
                      </p>
                      <p className="text-xs text-gray-300">
                        {entry.category || ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">
                      {entry.score}
                    </p>
                    {entry.accuracy !== undefined && (
                      <p className="text-xs text-gray-300">
                        {entry.accuracy}% accuracy
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
