import Image from 'next/image';
import { useState, useEffect } from 'react';

const partners = [
  { name: 'CacheFlow', logo: '/logos/cacheflow.png' },
  { name: 'Avesha', logo: '/logos/avesha.png' },
  { name: 'Sage', logo: '/logos/sage.png' },
  { name: 'Foucs45', logo: '/logos/focus.png' },
  { name: 'Wayfair', logo: '/logos/wayfair.png' },
];

const testimonials = [
  {
    quote:
      'Teamcast made it incredibly easy to scale our team with high-quality candidates. The speed and automation were exactly what we needed.',
    author: {
      name: 'CacheFlow Team',
      role: 'Engineering Leadership',
    },
  },
  {
    quote:
      'We were impressed by how quickly Teamcast matched us with talent that fit both our technical needs and company culture.',
    author: {
      name: 'Avesha',
      role: 'Talent Acquisition',
    },
  },
  {
    quote:
      'Teamcast helped us grow efficiently across regions without the usual hiring complexities. It&apos;s a truly seamless platform.',
    author: {
      name: 'WayFair',
      role: 'HR Operations',
    },
  },
  {
    quote:
      'With Teamcast, we were able to onboard skilled professionals faster than ever—no delays, no compliance hurdles.',
    author: {
      name: 'Sage Advantage',
      role: 'People Operations',
    },
  },
  {
    quote:
      'Teamcast delivered a smooth, end-to-end hiring experience. From sourcing to onboarding, everything was handled effortlessly.',
    author: {
      name: 'Focus 451',
      role: 'Recruitment Team',
    },
  },
];

export function PartnerLogosSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Change testimonial every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-muted py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-muted-foreground text-base font-semibold tracking-wide uppercase">
            Trusted by leading companies
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-12 md:grid-cols-3 lg:grid-cols-5">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="col-span-1 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={140}
                height={45}
                className="max-h-10 w-auto grayscale transition-all duration-300 hover:grayscale-0 dark:invert dark:hover:invert-0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotating Testimonials Section */}
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div
            key={currentTestimonial}
            className="space-y-4 transition-all duration-500 ease-in-out"
          >
            <blockquote className="text-muted-foreground mx-auto max-w-4xl text-lg">
              &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
            </blockquote>
            <div className="mt-4">
              <p className="text-foreground font-semibold">
                {testimonials[currentTestimonial].author.name}
              </p>
              <p className="text-muted-foreground">
                {testimonials[currentTestimonial].author.role}
              </p>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="mt-8 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? 'bg-primary w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
