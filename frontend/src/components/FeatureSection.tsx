const FeatureSection = () => {
  return (
    <section className="py-2 bg-background">
      <div className="container mx-auto px-6">
        {/* Trust Badges */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 text-center py-12 border-y border-border">
          <div className="text-sm text-muted-foreground">Multi-tenant by design</div>
          <div className="text-sm text-muted-foreground">Data stays in your region</div>
          <div className="text-sm text-muted-foreground">PII redaction options</div>
          <div className="text-sm text-muted-foreground">GDPR-ready</div>
          <div className="text-sm text-muted-foreground">No AI training using your data</div>
        </div>

        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">
            Trusted by product, growth, and ops teams at fast-moving storefronts.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;