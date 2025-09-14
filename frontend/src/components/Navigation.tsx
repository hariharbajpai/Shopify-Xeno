import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="logo-glow">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">X</span>
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                Xenoit
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Get a demo
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/auth/google" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/auth/google">
              <Button className="btn-hero text-sm h-10">
                Start 14-day free trial
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Link 
              to="/auth/google"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;