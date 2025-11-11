import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hide navbar on auth page
  if (location.pathname === '/auth') return null;

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center font-bold text-primary-foreground">
              🐝
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SpeakBee
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/session" className="text-sm font-medium hover:text-primary transition-colors">
              Practice
            </Link>
            <Link to="/progress" className="text-sm font-medium hover:text-primary transition-colors">
              Progress
            </Link>
            <Button variant="default" size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-3 animate-slide-up">
            <Link
              to="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/session"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Practice
            </Link>
            <Link
              to="/progress"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Progress
            </Link>
            <Button variant="default" size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
