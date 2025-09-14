import { useState } from "react";

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What does Xenoit analyze?",
      answer: "Orders, customers, products, and line items. Optional: events like checkouts started or carts abandoned (via webhooks)."
    },
    {
      question: "Does Xenoit support multiple stores?",
      answer: "Yes—native multi-tenant support with strict isolation. Analyze each store alone or compare across selected tenants."
    },
    {
      question: "How fresh is the data?",
      answer: "Real-time webhooks for changes; scheduled backfills to keep history complete."
    },
    {
      question: "Where is my data stored?",
      answer: "Choose a region during setup (subject to your cloud/plan). Ask us if you need a specific geography."
    },
    {
      question: "Can I export charts or evidence?",
      answer: "Yes—export CSV for tables and PNG/SVG for charts. Evidence links keep provenance intact."
    },
    {
      question: "Does Xenoit train AI on my data?",
      answer: "No. We never use your data to train models."
    }
  ];

  return (
    <section className="py-4 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
            FAQs
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-background border border-border rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="text-lg font-medium text-foreground">{faq.question}</span>
                  <div className={`transform transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-4">Get started for free</h3>
            <button className="btn-hero text-lg h-14 px-8">
              Start 14-day free trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;