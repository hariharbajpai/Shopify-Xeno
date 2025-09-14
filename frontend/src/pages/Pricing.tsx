import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses just getting started",
      price: "$29",
      period: "per month",
      features: [
        "Up to 1,000 orders/month",
        "Basic analytics dashboard",
        "Email support",
        "1 store connection",
        "Standard reporting",
        "CSV exports"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      description: "For growing businesses that need advanced insights",
      price: "$79",
      period: "per month",
      features: [
        "Up to 10,000 orders/month",
        "Advanced analytics & insights",
        "Priority email support",
        "Up to 5 store connections",
        "Custom reporting",
        "API access",
        "Real-time webhooks",
        "Advanced segmentation"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      description: "For large businesses with complex needs",
      price: "$199",
      period: "per month",
      features: [
        "Unlimited orders",
        "Full analytics suite",
        "Dedicated support manager",
        "Unlimited store connections",
        "White-label reporting",
        "Advanced API access",
        "Custom integrations",
        "Multi-tenant architecture",
        "SLA guarantee",
        "Custom data retention"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the plan that fits your business needs. All plans include a 14-day free trial.
            </p>
            <div className="flex items-center justify-center gap-4 mb-12">
              <Badge variant="secondary" className="text-sm">
                💳 No credit card required
              </Badge>
              <Badge variant="secondary" className="text-sm">
                🔄 Cancel anytime
              </Badge>
              <Badge variant="secondary" className="text-sm">
                📞 24/7 support
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-accent shadow-lg scale-105' : 'border-border'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path 
                              d="M10 3L4.5 8.5L2 6" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="text-accent"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth/google" className="block">
                    <Button 
                      className={`w-full h-12 ${plan.popular ? 'btn-hero' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Frequently asked questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  What happens during the free trial?
                </h3>
                <p className="text-muted-foreground">
                  You get full access to all features of your chosen plan for 14 days. No credit card required to start.
                </p>
              </div>
              
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Can I change plans later?
                </h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
                </p>
              </div>
              
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  What if I exceed my order limit?
                </h3>
                <p className="text-muted-foreground">
                  We'll notify you before you reach your limit. You can either upgrade your plan or pay for additional orders at $0.10 per order.
                </p>
              </div>
              
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Do you offer custom enterprise solutions?
                </h3>
                <p className="text-muted-foreground">
                  Yes! Contact our sales team for custom pricing, on-premise deployment, and enterprise features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of businesses already using Xenoit to optimize their operations.
            </p>
            <Link to="/auth/google">
              <Button className="btn-hero text-lg h-14 px-8">
                Start your free trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;