const CtaSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Main Hero */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            All your commerce data.{" "}
            <span className="text-accent">One place.</span>{" "}
            Instant answers.
          </h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">Fast</div>
              <p className="text-muted-foreground">Ingests and analyzes store data in seconds.</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">Accurate</div>
              <p className="text-muted-foreground">Built to minimize noise and avoid hallucinations.</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">Trustworthy</div>
              <p className="text-muted-foreground">Every insight is backed by raw data.</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">Scalable</div>
              <p className="text-muted-foreground">Works across many stores and large catalogs.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <button className="btn-hero text-lg h-14 px-8">
              Start 14-day free trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;