'use client';

import { Mail, Phone, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 15,
    },
  },
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Our team typically responds within 24 hours',
    contact: 'hello@teamcast.com',
    action: 'Send Email',
    href: 'mailto:hello@teamcast.com',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Urgent? Speak directly with our sales team directly',
    contact: '+1 (650) 695-9495',
    action: 'Call Now',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Get instant answers to your questions',
    contact: 'Available 9 AM - 6 PM PST',
    action: 'Start Chat',
    href: '#chat',
  },
];

const officeLocations = [
  {
    city: 'San Francisco',
    address: '2627 Hanover St, Palo Alto',
    zipCode: 'San Francisco, CA 94303',
    phone: '+1 (650) 695-9495',
    isHeadquarters: true,
  },
  {
    city: 'India - Pune',
    address: 'A-1102, Montclaire, Baner-Pashan Link Road, Pashan',
    zipCode: 'Pune, Maharashtra 411021',
    phone: '+91 85301 16304',
    isHeadquarters: false,
  },
  {
    city: 'India - Hyderabad',
    address:
      'Plot No.50, 1st Floor, Behind Raheja Mindspace, Gafoor Nagar Village',
    zipCode: 'Hyderabad, Telangana 500081',
    phone: '+91 85301 16304',
    isHeadquarters: false,
  },
];

export function ContactPageWrapper() {
  return (
    <motion.div
      className="bg-background"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.section
        variants={sectionVariants}
        className="from-muted/50 to-background relative isolate overflow-hidden bg-gradient-to-b py-24 lg:py-32"
      >
        {/* Background Elements */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#6e55cf]/20 to-[#8b6edb]/10 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center rounded-full bg-[#6e55cf]/10 px-4 py-1 text-sm font-medium text-[#6e55cf] ring-1 ring-[#6e55cf]/10 ring-inset"
            >
              💬 We&apos;re here to help
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-foreground mt-8 mb-8 text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Get in{' '}
              <span className="bg-gradient-to-r from-[#6e55cf] to-[#8b6edb] bg-clip-text text-transparent">
                Touch
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg"
            >
              Ready to transform your hiring process? Our team is here to help
              you find the perfect solution for your organization&apos;s unique
              needs.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Contact Methods */}
      <motion.section variants={sectionVariants} className="">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                className="group bg-card relative flex flex-col items-center rounded-2xl border p-8 text-center transition-all duration-300 hover:border-[#6e55cf]/20 hover:shadow-lg"
                variants={sectionVariants}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', damping: 15, delay: index * 0.1 }}
              >
                {/* Icon */}
                <motion.div
                  className="mb-6 rounded-full bg-[#6e55cf]/10 p-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <method.icon className="h-8 w-8 text-[#6e55cf]" />
                </motion.div>

                {/* Title */}
                <div className="text-foreground mb-4 text-xl font-semibold">
                  {method.title}
                </div>

                {/* Description */}
                <div className="text-muted-foreground mb-4 text-base">
                  {method.description}
                </div>

                {/* Contact Info */}
                <div className="text-foreground mb-8 font-medium">
                  {method.contact}
                </div>

                {/* Button */}
                <Button
                  asChild
                  className="group w-full bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
                >
                  <a
                    href={method.href}
                    className="flex items-center justify-center gap-2"
                  >
                    {method.action}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </a>
                </Button>

                {/* Decorative line */}
                <motion.div
                  className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-gradient-to-r from-[#6e55cf] to-[#8b6edb]"
                  initial={{ width: 0 }}
                  whileInView={{ width: '6rem' }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                  viewport={{ once: true }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Office Locations */}
      <motion.section variants={sectionVariants} className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700 ring-1 ring-green-200 ring-inset"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Global presence
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Visit Our Offices
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-muted-foreground mx-auto max-w-2xl text-lg"
            >
              Connect with us at one of our locations around the world.
            </motion.p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-3">
            {officeLocations.map((office, index) => (
              <motion.div
                key={office.city}
                className="group bg-card relative flex flex-col items-center rounded-2xl border p-8 text-center transition-all duration-300 hover:border-[#6e55cf]/20 hover:shadow-lg"
                variants={sectionVariants}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', damping: 15, delay: index * 0.1 }}
              >
                {/* Icon */}
                <motion.div
                  className="mb-6 rounded-full bg-[#6e55cf]/10 p-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <MapPin className="h-8 w-8 text-[#6e55cf]" />
                </motion.div>

                {/* Title */}
                <div className="text-foreground mb-4 text-xl font-semibold">
                  {office.city}
                  {office.isHeadquarters && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#6e55cf]/10 px-2.5 py-0.5 text-xs font-medium text-[#6e55cf]">
                      HQ
                    </span>
                  )}
                </div>

                {/* Address */}
                <address className="text-muted-foreground mb-6 text-base leading-relaxed not-italic">
                  {office.address}
                  <br />
                  {office.zipCode}
                </address>

                {/* Phone */}
                <div className="group/link flex items-center">
                  <div className="mr-3 rounded-lg bg-[#6e55cf]/10 p-2 transition-colors group-hover/link:bg-[#6e55cf]/20">
                    <Phone className="h-4 w-4 text-[#6e55cf]" />
                  </div>
                  <a
                    href={`tel:${office.phone.replace(/\s/g, '')}`}
                    className="text-foreground font-medium transition-colors hover:text-[#6e55cf]"
                  >
                    {office.phone}
                  </a>
                </div>

                {/* Decorative line */}
                <motion.div
                  className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-gradient-to-r from-[#6e55cf] to-[#8b6edb]"
                  initial={{ width: 0 }}
                  whileInView={{ width: '6rem' }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                  viewport={{ once: true }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
