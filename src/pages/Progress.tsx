import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Flame, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProgressPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      const { data: achievementsData, error: achievementsError } = await supabase
        .from("achievements")
        .select("*");

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      const { data: earnedData, error: earnedError } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (earnedError) throw earnedError;
      setEarnedAchievements(earnedData?.map((a: any) => a.achievement_id) || []);

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

  const getIconComponent = (iconName: string) => {
    const icons: any = { Trophy, Award, Star, Flame, Zap };
    return icons[iconName] || Trophy;
  };

  const averageAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy_score, 0) / sessions.length)
    : 0;

  const averagePronunciation = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.pronunciation_score, 0) / sessions.length)
    : 0;

  const averageClarity = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.clarity_score, 0) / sessions.length)
    : 0;

  const averageFluency = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.fluency_score, 0) / sessions.length)
    : 0;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">Your Progress 📊</h1>
          <p className="text-muted-foreground">
            Track your improvement and celebrate your achievements
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{averageAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Average Accuracy</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-secondary mb-2">{sessions.length}</p>
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-accent mb-2">{profile?.streak_days || 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle>Skills Breakdown</CardTitle>
            <CardDescription>Your performance across different areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Pronunciation</span>
                <span className="text-primary font-semibold">{averagePronunciation}%</span>
              </div>
              <Progress value={averagePronunciation} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Fluency</span>
                <span className="text-primary font-semibold">{averageFluency}%</span>
              </div>
              <Progress value={averageFluency} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Clarity</span>
                <span className="text-primary font-semibold">{averageClarity}%</span>
              </div>
              <Progress value={averageClarity} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const isEarned = earnedAchievements.includes(achievement.id);
                  const IconComponent = getIconComponent(achievement.icon);
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`flex flex-col items-center p-4 rounded-lg ${
                        isEarned
                          ? "bg-gradient-hero shadow-soft"
                          : "bg-muted/30 opacity-50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 ${
                          isEarned ? "bg-primary" : "bg-muted"
                        } rounded-full flex items-center justify-center mb-2`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs text-center font-medium">{achievement.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sessions yet</p>
                ) : (
                  sessions.slice(0, 5).map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{session.phrase}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={session.accuracy_score >= 85 ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {session.accuracy_score}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;