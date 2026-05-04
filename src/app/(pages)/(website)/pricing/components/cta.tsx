'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Calendar, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function PricingCTA() {
  const router = useRouter();

  const handleContactSales = () => {
    router.push('/contact');
  };

  const handleScheduleDemo = () => {
    // You can replace this with your actual demo scheduling link
    window.open('https://calendly.com/teamcast-demo', '_blank');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#6e55cf] via-[#5d46b8] to-[#4c3996] py-24">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Need Help Choosing?
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Still have questions?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl leading-8 text-white/90"
          >
            Our team is here to help you choose the right plan and get started
            with AI-powered hiring
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              onClick={handleContactSales}
              size="lg"
              className="group h-12 bg-white px-8 text-[#6e55cf] shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl"
            >
              <Phone className="mr-2 h-5 w-5" />
              Contact Sales
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            <Button
              onClick={handleScheduleDemo}
              size="lg"
              variant="outline"
              className="group border-background text-secondary-foreground hover:bg-secondary"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 space-y-6 text-white/80"
          >
            <div className="flex flex-col items-center justify-center gap-4 text-sm sm:flex-row">
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                ✓ Free consultation
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                ✓ No commitment required
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                ✓ Custom solutions available
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 text-sm sm:flex-row">
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                🚀 Average response time: 2 hours
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                ⭐ 98% customer satisfaction
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid gap-8 sm:grid-cols-3"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="mt-2 text-sm text-white/80">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50%</div>
              <div className="mt-2 text-sm text-white/80">Faster Hiring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="mt-2 text-sm text-white/80">
                Support Available
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
