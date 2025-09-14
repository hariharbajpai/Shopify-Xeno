import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">About</Link>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Help Center</Link>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Blog</Link>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Sample datasets</Link>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Guides</Link>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Privacy policy</Link>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Cookie policy</Link>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Terms and conditions</Link>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Comparisons</h3>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Xenoit vs. spreadsheets</Link>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Xenoit vs. DIY dashboards</Link>
            <Link to="#" className="block text-sm text-muted-foreground hover:text-foreground mb-2">Xenoit vs. generic chatbots</Link>
          </div>
        </div>
        
        <div className="border-t border-border pt-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Xenoit. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Built for Xeno Internship Assignment 2025.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;