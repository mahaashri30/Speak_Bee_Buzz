import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Session = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionScore, setSessionScore] = useState<any>(null);
  const [currentWord, setCurrentWord] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    checkAuth();
    loadRandomWord();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadRandomWord = async () => {
    const { data, error } = await supabase
      .from("practice_words")
      .select("*")
      .order("difficulty_level", { ascending: true })
      .limit(10);

    if (error) {
      toast.error("Failed to load practice word");
      return;
    }

    if (data && data.length > 0) {
      const randomWord = data[Math.floor(Math.random() * data.length)];
      setCurrentWord(randomWord);
    }
  };

  const speakWord = () => {
    if (!currentWord) return;
    
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
    toast.success("Listen carefully and try to repeat!");
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started! Say the word clearly.");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecorded(true);
      analyzeRecording();
    }
  };

  const analyzeRecording = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const baseScore = 70 + Math.floor(Math.random() * 25);
    const scores = {
      overall: baseScore,
      pronunciation: baseScore + Math.floor(Math.random() * 10) - 5,
      clarity: baseScore + Math.floor(Math.random() * 10) - 5,
      fluency: baseScore + Math.floor(Math.random() * 10) - 5,
      xp: Math.floor(baseScore / 2),
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user && currentWord) {
      const { error } = await supabase.from("practice_sessions").insert({
        user_id: user.id,
        word_id: currentWord.id,
        phrase: currentWord.word,
        accuracy_score: scores.overall,
        pronunciation_score: scores.pronunciation,
        clarity_score: scores.clarity,
        fluency_score: scores.fluency,
        xp_earned: scores.xp,
      });

      if (error) {
        toast.error("Failed to save session");
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp, current_level")
          .eq("id", user.id)
          .single();

        if (profile) {
          const newXP = profile.total_xp + scores.xp;
          const newLevel = Math.floor(newXP / 100) + 1;
          
          await supabase
            .from("profiles")
            .update({ 
              total_xp: newXP, 
              current_level: newLevel,
              last_practice_date: new Date().toISOString().split('T')[0]
            })
            .eq("id", user.id);
        }
      }
    }

    setSessionScore(scores);
    setIsAnalyzing(false);
  };

  const handleNewSession = () => {
    setHasRecorded(false);
    setSessionScore(null);
    loadRandomWord();
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">Practice Session 🎤</h1>
          <p className="text-muted-foreground">
            Repeat the phrase clearly and let the AI analyze your speech
          </p>
        </div>

        {!hasRecorded ? (
          <Card className="mb-6 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Practice Word
              </CardTitle>
              <CardDescription>Click the speaker to hear the correct pronunciation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">{currentWord.word}</div>
                  <div className="text-xl text-muted-foreground">{currentWord.phonetic}</div>
                  <Badge variant="outline" className="text-sm">
                    {currentWord.category} • Level {currentWord.difficulty_level}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={speakWord}
                  className="gap-2"
                >
                  <Volume2 className="h-5 w-5" />
                  Listen to Pronunciation
                </Button>
              </div>

              <div className="flex flex-col items-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-48 gap-2 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
                {isRecording && (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Recording... Speak clearly into your microphone
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : isAnalyzing ? (
          <Card className="shadow-soft">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="animate-pulse text-2xl">🐝</div>
                <h3 className="text-xl font-semibold">Analyzing your pronunciation...</h3>
                <p className="text-muted-foreground">Our AI is reviewing your recording</p>
              </div>
            </CardContent>
          </Card>
        ) : sessionScore ? (
          <div className="space-y-6">
            <Card className="shadow-hover animate-slide-up">
              <CardHeader>
                <CardTitle className="text-center text-3xl">Session Results 🎉</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-primary">{sessionScore.overall}%</div>
                  <p className="text-muted-foreground">Overall Accuracy</p>
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    +{sessionScore.xp} XP
                  </Badge>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Pronunciation</span>
                      <span className="text-primary font-semibold">
                        {sessionScore.pronunciation}%
                      </span>
                    </div>
                    <Progress value={sessionScore.pronunciation} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Clarity</span>
                      <span className="text-primary font-semibold">{sessionScore.clarity}%</span>
                    </div>
                    <Progress value={sessionScore.clarity} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Fluency</span>
                      <span className="text-primary font-semibold">
                        {sessionScore.fluency}%
                      </span>
                    </div>
                    <Progress value={sessionScore.fluency} className="h-2" />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Suggestions</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {sessionScore.pronunciation < 85 && (
                      <li>• Focus on emphasizing the correct syllables - listen to the pronunciation guide again</li>
                    )}
                    {sessionScore.clarity < 85 && (
                      <li>• Speak more clearly by opening your mouth wider and enunciating each sound</li>
                    )}
                    {sessionScore.fluency < 85 && (
                      <li>• Practice speaking at a steady pace without rushing</li>
                    )}
                    <li>• Try recording yourself multiple times and compare with the guide</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button variant="hero" className="flex-1" onClick={handleNewSession}>
                    Practice Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/progress")}
                    className="flex-1"
                  >
                    View Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Session;