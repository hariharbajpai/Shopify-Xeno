import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Eye, 
  Brain, 
  Shield, 
  Globe, 
  Layers,
  ArrowRight,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  MousePointer2,
  Clock,
  Target
} from "lucide-react";

const InteractiveFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState<number | null>(null);

  const features = [
    {
      icon: Eye,
      title: "Real-time Insights",
      subtitle: "Live data updates every second",
      description: "Watch your business metrics update in real-time. No more waiting for reports or manual refreshes.",
      preview: {
        type: "live-counter",
        data: { revenue: "₹14,52,33,000", orders: "2,930", customers: "1,080" }
      },
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Analytics",
      subtitle: "Smart predictions & recommendations",
      description: "Get intelligent insights that help you make better decisions. Our AI analyzes patterns you might miss.",
      preview: {
        type: "ai-insights",
        data: { score: "94/100", prediction: "+15.2%", confidence: "87%" }
      },
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      subtitle: "Sub-second query responses",
      description: "Process millions of data points instantly. Built for scale with enterprise-grade performance.",
      preview: {
        type: "performance",
        data: { speed: "0.3s", throughput: "10M/sec", uptime: "99.9%" }
      },
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      subtitle: "Bank-level encryption & privacy",
      description: "Your data is protected with industry-leading security standards. SOC2 compliant and GDPR ready.",
      preview: {
        type: "security",
        data: { encryption: "AES-256", compliance: "SOC2", uptime: "99.9%" }
      },
      color: "from-green-500 to-emerald-600"
    }
  ];

  const renderPreview = (feature: typeof features[0]) => {
    switch (feature.preview.type) {
      case "live-counter":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue Today</span>
              <span className="font-bold text-green-600">{feature.preview.data.revenue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Orders</span>
              <span className="font-bold text-blue-600">{feature.preview.data.orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="font-bold text-purple-600">{feature.preview.data.customers}</span>
            </div>
          </div>
        );
      case "ai-insights":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Business Health</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full"></div>
                </div>
                <span className="font-bold text-green-600">{feature.preview.data.score}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growth Prediction</span>
              <span className="font-bold text-green-600">{feature.preview.data.prediction}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">AI Confidence</span>
              <span className="font-bold text-purple-600">{feature.preview.data.confidence}</span>
            </div>
          </div>
        );
      case "performance":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Query Speed</span>
              <span className="font-bold text-green-600">{feature.preview.data.speed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Throughput</span>
              <span className="font-bold text-blue-600">{feature.preview.data.throughput}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="font-bold text-green-600">{feature.preview.data.uptime}</span>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Encryption</span>
              <span className="font-bold text-green-600">{feature.preview.data.encryption}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compliance</span>
              <span className="font-bold text-blue-600">{feature.preview.data.compliance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Security Score</span>
              <span className="font-bold text-green-600">A+</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Interactive Experience
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Built for the way you work
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed with real user needs in mind. 
              Simple, powerful, and refreshingly human.
            </p>
          </div>

          {/* Interactive Feature Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Feature Navigation */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                const isActive = activeFeature === index;
                const isHovered = isHovering === index;
                
                return (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      isActive 
                        ? 'border-accent shadow-lg bg-accent/5' 
                        : 'border-border hover:border-accent/50'
                    } ${isHovered ? 'scale-[1.02]' : ''}`}
                    onClick={() => setActiveFeature(index)}
                    onMouseEnter={() => setIsHovering(index)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                            {isActive && (
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-sm text-accent font-medium mb-2">{feature.subtitle}</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Feature Preview */}
            <div className="lg:pl-8">
              <div className="sticky top-8">
                <Card className="border-2 border-border/50 shadow-2xl bg-white">
                  <div className="bg-gray-50 border-b border-border/50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-500 font-mono">feature preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      {React.createElement(features[activeFeature].icon, { 
                        className: `h-8 w-8 bg-gradient-to-br ${features[activeFeature].color} bg-clip-text text-transparent` 
                      })}
                      <div>
                        <h4 className="text-xl font-bold text-foreground">{features[activeFeature].title}</h4>
                        <p className="text-sm text-muted-foreground">{features[activeFeature].subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      {renderPreview(features[activeFeature])}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MousePointer2 className="h-4 w-4" />
                        <span>Click features to explore</span>
                      </div>
                      <Button variant="outline" size="sm" className="group">
                        Learn more
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-3xl p-12 border border-accent/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Experience the difference
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                See why 1,000+ businesses choose Xenoit for their analytics needs. 
                No complex setup, no hidden costs, no compromises.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="btn-hero text-lg h-14 px-8 group">
                  <Play className="mr-2 h-5 w-5" />
                  Try it now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" className="text-lg h-14 px-8">
                  Book a demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatures;