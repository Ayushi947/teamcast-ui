'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'Can I change plans later?',
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "Yes, we offer refunds for unused portions of your subscription. If you're not satisfied, contact our support team to discuss your options.",
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes! We offer a 14-day free trial for all plans. No credit card required. You can explore all features and see how Teamcast fits your needs.',
  },
  {
    question: 'How does the AI matching work?',
    answer:
      'Our AI analyzes job requirements, candidate skills, experience, and preferences to create intelligent matches. It learns from successful hires to improve accuracy over time.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Absolutely! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'We offer 24/7 email support for all plans, priority support for Professional plans, and dedicated account managers for Enterprise customers.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we take security seriously. We use enterprise-grade encryption, SOC 2 compliance, and regular security audits to protect your data.',
  },
];

const _containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-muted/30 relative overflow-hidden py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about our pricing and features
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-background border-border overflow-hidden rounded-xl border shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="hover:bg-muted/50 flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-200"
              >
                <span className="text-foreground pr-4 text-lg font-semibold">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="h-5 w-5 text-[#6e55cf]" />
                  ) : (
                    <Plus className="text-muted-foreground h-5 w-5" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pt-2 pb-5">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-background border-border rounded-2xl border p-8 shadow-sm">
            <h3 className="text-foreground mb-3 text-xl font-semibold">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our support
              team is here to help.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => window.open('/contact', '_blank')}
                className="rounded-lg bg-[#6e55cf] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#6e55cf]/90"
              >
                Contact Support
              </button>
              <button
                onClick={() => window.open('/help', '_blank')}
                className="bg-muted text-foreground hover:bg-muted/80 rounded-lg px-6 py-3 font-medium transition-colors duration-200"
              >
                Visit Help Center
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
