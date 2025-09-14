import { useState } from "react";

const PrivacySection = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const privacyItems = [
    {
      title: "We follow strong security practices",
      content: "External audits and internal controls guide our security posture. We protect systems against unauthorized access, abuse, and data leakage."
    },
    {
      title: "Your data stays in your chosen region",
      content: "We host on reputable cloud providers. Uploaded data (e.g., orders, customers, products) is kept in your selected region when configured."
    },
    {
      title: "PII redaction",
      content: "We provide options to reduce PII in generated insights (names, emails). While this works well, it's not 100% bulletproof—please report misses so we can improve."
    },
    {
      title: "GDPR-ready",
      content: "We take privacy seriously. See our privacy policy for details on data handling, access, and requests."
    },
    {
      title: "Data deletion",
      content: "Delete data anytime from your workspace. We purge associated artifacts (e.g., derived transcripts or caches) during deletion workflows. You'll still keep aggregate insights that no longer contain personal data."
    },
    {
      title: "Your data is never used to train AI models",
      content: "We don't train proprietary models on your data. Our providers (e.g., OpenAI/Anthropic) also offer no-training guarantees for API usage."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Privacy and security first
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            We follow strong security practices
          </p>
          
          <div className="space-y-4">
            {privacyItems.map((item, index) => (
              <div key={index} className="border border-border rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                >
                  <span className="text-lg font-medium text-foreground">{item.title}</span>
                  <div className={`transform transition-transform ${openAccordion === index ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                
                {openAccordion === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;