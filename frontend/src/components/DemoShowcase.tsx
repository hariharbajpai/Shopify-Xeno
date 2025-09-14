import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Eye,
  MousePointer,
  Zap,
  Sparkles,
  Target,
  Globe
} from "lucide-react";

const DemoShowcase = () => {
  const [activeDemo, setActiveDemo] = useState<'overview' | 'analytics' | 'insights'>('overview');
  const [isHovering, setIsHovering] = useState(false);

  const demoViews = {
    overview: {
      title: "Dashboard Overview",
      description: "Get a bird's eye view of your business performance",
      stats: [
        { label: "Active Customers", value: "1.12M", trend: "+12.3%", color: "text-cyan-600" },
        { label: "Total Revenue", value: "₹434Cr", trend: "+15.2%", color: "text-green-600" },
        { label: "Orders Today", value: "3,860", trend: "+8.7%", color: "text-yellow-600" },
        { label: "Conversion Rate", value: "2.85%", trend: "+0.3%", color: "text-purple-600" }
      ]
    },
    analytics: {
      title: "Advanced Analytics",
      description: "Deep dive into customer behavior and trends",
      stats: [
        { label: "Customer LTV", value: "₹14,799", trend: "+23.1%", color: "text-blue-600" },
        { label: "Repeat Rate", value: "48.1%", trend: "+5.2%", color: "text-emerald-600" },
        { label: "Churn Rate", value: "14.2%", trend: "-2.1%", color: "text-orange-600" },
        { label: "AOV", value: "₹4,950", trend: "-2.1%", color: "text-red-600" }
      ]
    },
    insights: {
      title: "AI-Powered Insights",
      description: "Smart recommendations to grow your business",
      stats: [
        { label: "Growth Score", value: "94/100", trend: "+8 pts", color: "text-indigo-600" },
        { label: "Market Share", value: "23.4%", trend: "+1.2%", color: "text-pink-600" },
        { label: "Efficiency", value: "87%", trend: "+12%", color: "text-teal-600" },
        { label: "Innovation", value: "8.7/10", trend: "+0.4", color: "text-violet-600" }
      ]
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Eye className="h-4 w-4" />
              Live Preview
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              See it in action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of simplified analytics. No signup required.
            </p>
          </div>

          {/* Demo Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white border border-border rounded-2xl p-2 shadow-lg">
              {Object.entries(demoViews).map(([key, view]) => (
                <button
                  key={key}
                  onClick={() => setActiveDemo(key as keyof typeof demoViews)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeDemo === key
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {view.title}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Demo Window */}
          <div className="max-w-4xl mx-auto">
            <div 
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-border/50 transition-all duration-500 hover:shadow-3xl"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Window Header */}
              <div className="bg-gray-50 border-b border-border/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500 font-mono">xenoit.com/dashboard</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {demoViews[activeDemo].title}
                    </h3>
                    <p className="text-muted-foreground">
                      {demoViews[activeDemo].description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Sparkles className="h-4 w-4" />
                    <span>Real-time data</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {demoViews[activeDemo].stats.map((stat, index) => (
                    <Card key={index} className="border-border/50 hover:border-accent/30 transition-all duration-300 hover:scale-105">
                      <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {stat.trend}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Interactive Chart Placeholder */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-dashed border-border/30 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                    <BarChart3 className="h-6 w-6" />
                    <span className="font-medium">Interactive Charts & Visualizations</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    15+ chart types, real-time updates, and smart filtering
                  </p>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-border shadow-sm">
                      <MousePointer className="h-4 w-4 text-accent" />
                      <span className="text-sm text-foreground">Click to explore</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to transform your analytics?
              </h3>
              <p className="text-muted-foreground mb-8">
                Join 1,000+ businesses already using Xenoit to make data-driven decisions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/dashboard">
                  <Button className="btn-hero text-lg h-14 px-8 group">
                    <Play className="mr-2 h-5 w-5" />
                    Explore Full Demo
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/auth/google">
                  <Button variant="outline" className="text-lg h-14 px-8 group">
                    Start Free Trial
                    <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoShowcase;