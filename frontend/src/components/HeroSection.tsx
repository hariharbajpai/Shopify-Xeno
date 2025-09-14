import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Play, BarChart3, Users, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleDemoClick = () => {
    setIsPlaying(true);
    setShowPreview(true);
    
    // Auto-hide preview after 3 seconds
    setTimeout(() => {
      setShowPreview(false);
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <section className="hero-background min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="container text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="fade-in-up text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Xenoit — Your Stats,{" "}
            <span className="text-accent">Simplified</span>
          </h1>
          
          {/* Subtext */}
          <p className="fade-in-up-delay text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Track customers, orders, and revenue in real-time. 
            Just log in and see everything in one dashboard.
          </p>
          
          {/* CTAs */}
          <div className="fade-in-up-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/auth/google">
              <Button className="btn-hero text-lg h-14 w-full sm:w-auto min-w-[200px] group">
                <span>Login with Google</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <Button 
              onClick={handleDemoClick}
              variant="outline" 
              className="btn-ghost text-lg h-14 w-full sm:w-auto min-w-[200px] group relative overflow-hidden"
            >
              <Play className={`mr-2 h-4 w-4 transition-all duration-300 ${isPlaying ? 'scale-110 text-accent' : ''}`} />
              <span>{isPlaying ? 'Loading...' : 'View Live Demo'}</span>
              {isPlaying && (
                <div className="absolute inset-0 bg-accent/10 animate-pulse" />
              )}
            </Button>
          </div>

          {/* Interactive Demo Preview */}
          {showPreview && (
            <div className="fade-in-up bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500 font-mono">xenoit.com/dashboard</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-cyan-600" />
                    <span className="text-xs text-cyan-700 font-medium">Customers</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-900">1.12M</div>
                  <div className="text-xs text-cyan-600">+12.3% this month</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">₹434Cr</div>
                  <div className="text-xs text-green-600">+15.2% growth</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-yellow-700 font-medium">Orders</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">876K</div>
                  <div className="text-xs text-yellow-600">+8.7% increase</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Sparkles className="h-4 w-4" />
                <span>Real dashboard preview • Click to explore the full experience</span>
              </div>
              
              <Link to="/dashboard" className="block mt-4">
                <Button className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white">
                  Open Full Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Quick Stats Teasers */}
          {!showPreview && (
            <div className="fade-in-up-delay-3 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">1.12M</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">₹434Cr</div>
                <div className="text-sm text-muted-foreground">Revenue Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">876K</div>
                <div className="text-sm text-muted-foreground">Orders Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">2.85%</div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/3 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/3 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
};

export default HeroSection;