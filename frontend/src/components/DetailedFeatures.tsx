const DetailedFeatures = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Unlock massive scale */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Unlock massive scale
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Search and analyze across unlimited Shopify stores and datasets.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Cross-store queries with tenant isolation</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Optimized for orders, customers, products at scale</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Deep analysis of months of sales and tens of thousands of SKUs at once</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-background border border-border rounded-lg p-8">
            <blockquote className="text-lg text-foreground mb-4">
              "We connected multiple dev stores and got clean, evidence-backed insights in minutes—LTV, cohorts, and top SKUs—without building a pipeline."
            </blockquote>
            <div className="text-sm text-muted-foreground">
              <div className="font-semibold text-foreground">Harihar Bajpai</div>
              Product & UX Lead
            </div>
          </div>
        </div>

        {/* Find anything */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="order-2 lg:order-1">
            <div className="bg-background border border-border rounded-lg p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-accent rounded-full"></div>
                </div>
                <span className="text-foreground">Core Jobs to Be Done</span>
              </div>
              <div className="space-y-2 pl-11">
                <div className="text-sm text-muted-foreground">Music Discovery and Personalization</div>
                <div className="text-sm text-muted-foreground">Mood and Activity-Based Music Curation</div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Find anything in your commerce repository
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Never lose a signal again. Search across unlimited entities.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Instantly surface matching orders, customers, and products</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Jump from search → evidence → insight in one click</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Minimal hallucination—if Xenoit can't find it, it will tell you</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Flexible analysis */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Flexible analysis that serves you
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Your questions, your flow—Xenoit adapts.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Go beyond basic dashboards: LTV, cohorts, repeat-rate, AOV, contribution margin</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Ask follow-ups any time; insights auto-refresh as data changes</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span className="text-muted-foreground">Start analysis with your first store—scale to many later</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">No magic. Just answers backed by evidence.</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span className="text-sm text-muted-foreground">References for every chart and KPI</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span className="text-sm text-muted-foreground">One-click drill-down to the underlying orders/customers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span className="text-sm text-muted-foreground">Copy, export, and share evidence</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span className="text-sm text-muted-foreground">Answers are only from your data—not the public web</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-6">
              <blockquote className="text-sm text-foreground mb-3">
                "It's a game changer to validate hypotheses across many buyer segments in seconds. We still review key findings manually, but Xenoit saves hours every week."
              </blockquote>
              <div className="text-xs text-muted-foreground">
                <div className="font-semibold text-foreground">Cecilie Smestad</div>
                E-commerce Consultant
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailedFeatures;