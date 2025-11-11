import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Award, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    await loadUserData(user.id);
  };

  const loadUserData = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (sessionsError) throw sessionsError;
      setRecentSessions(sessionsData || []);

      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("practice_sessions")
        .select(`
          accuracy_score,
          profiles!inner(full_name)
        `)
        .order("accuracy_score", { ascending: false })
        .limit(5);

      if (leaderboardError) throw leaderboardError;
      
      const processedLeaderboard = leaderboardData?.map((item: any) => ({
        name: item.profiles.full_name,
        score: item.accuracy_score,
      })) || [];
      
      setLeaderboard(processedLeaderboard);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile.full_name}! 🐝
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your speaking journey?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <p className="text-3xl font-bold text-primary">{profile.current_level}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Streak Days</p>
                  <p className="text-3xl font-bold text-accent">{profile.streak_days}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-accent animate-pulse-glow" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Score</p>
                  <p className="text-3xl font-bold text-secondary">
                    {recentSessions[0]?.accuracy_score || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-bold text-foreground">{recentSessions.length}</p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => navigate("/session")}
              >
                Start New Session 🎤
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => navigate("/progress")}>
                  View Progress
                </Button>
                <Button variant="outline">Weekly Challenge</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions yet</p>
              ) : (
                recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{session.phrase}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={session.accuracy_score >= 80 ? "default" : "secondary"}>
                      {session.accuracy_score}%
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle>Top Performers This Week 🏆</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scores yet</p>
              ) : (
                leaderboard.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : index === 1
                            ? "bg-muted"
                            : index === 2
                            ? "bg-accent/20 text-accent"
                            : "bg-muted/50"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="font-semibold text-primary">{user.score}%</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;