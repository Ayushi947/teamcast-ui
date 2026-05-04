'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    content:
      "Teamcast's AI matching connected me with the perfect role at a leading tech company. The assessment process was smooth, and I landed my dream job as a Senior React Developer in just 3 weeks!",
    author: {
      name: 'Alex Rodriguez',
      role: 'Senior React Developer',
      company: 'TechFlow Inc.',
      image: '/images/testimonials/sarah.jpg',
    },
  },
  {
    content:
      'After months of traditional job searching, Teamcast found me a remote position that perfectly matched my skills and salary expectations. The AI-powered interviews were actually enjoyable!',
    author: {
      name: 'Priya Sharma',
      role: 'Full Stack Engineer',
      company: 'CloudVision',
      image: '/images/testimonials/raj.jpg',
    },
  },
  {
    content:
      "Teamcast helped me transition from a traditional finance role to a fintech product manager position. The platform understood my transferable skills better than any recruiter I've worked with.",
    author: {
      name: 'Jordan Kim',
      role: 'Product Manager',
      company: 'FinanceForward',
      image: '/images/testimonials/maria.jpg',
    },
  },
];

export function SuccessStoriesSection() {
  return (
    <div className="bg-background py-24 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-primary text-base leading-7 font-semibold">
            Success Stories
          </h2>
          <p className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Hear from Our Success Stories
          </p>
          <p className="text-muted-foreground mt-3 text-lg leading-8">
            Discover how talented professionals found their dream careers
            through Teamcast&apos;s AI-powered matching platform.
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card ring-border flex flex-col justify-between rounded-2xl p-8 shadow-sm ring-1 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(110,85,207,0.2)]"
              >
                <div className="flex gap-x-4">
                  <div className="flex-shrink-0">
                    <div className="relative h-10 w-10">
                      <Image
                        className="bg-muted rounded-full"
                        src={testimonial.author.image}
                        alt={testimonial.author.name}
                        fill
                        sizes="40px"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg leading-8 font-semibold">
                      {testimonial.author.name}
                    </h3>
                    <div className="text-muted-foreground text-sm leading-6">
                      {testimonial.author.role} at {testimonial.author.company}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mt-6 text-lg leading-8">
                  {`"${testimonial.content}"`}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
