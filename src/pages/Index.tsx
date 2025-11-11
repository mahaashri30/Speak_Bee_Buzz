import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, TrendingUp, Award, Target } from "lucide-react";
import beeMascot from "@/assets/bee-mascot.png";
import heroBackground from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-slide-up">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                Speak Better.<br />
                Feel Confident.
              </h1>
              <p className="text-xl mb-8 text-muted-foreground">
                Join SpeakBee and transform your speech with AI-powered therapy.
                Practice pronunciation, improve fluency, and track your progress!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/auth">Start Speaking! 🐝</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center animate-float">
              <img 
                src={beeMascot} 
                alt="SpeakBee Mascot" 
                className="w-64 h-64 lg:w-80 lg:h-80 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            How AI Helps You Speak Better
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Voice Analysis</h3>
                <p className="text-muted-foreground">
                  Real-time feedback on pronunciation and clarity using advanced AI.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Visualize your improvement with detailed charts and metrics.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
                <p className="text-muted-foreground">
                  Unlock badges and climb the leaderboard as you practice.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-soft hover:shadow-hover transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Goals</h3>
                <p className="text-muted-foreground">
                  Get custom exercises based on your specific needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users improving their speech with SpeakBee.
            Start practicing today!
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
