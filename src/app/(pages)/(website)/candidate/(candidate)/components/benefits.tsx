'use client';

import { motion } from 'framer-motion';

const benefits = [
  {
    name: 'Competitive US Salaries',
    description:
      'Access to US market rates and competitive compensation packages that reflect your skills and experience.',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.172-2.303 0-3.182C10.536 7.719 11.768 7.5 12 7.5c1.45 0 2.9.439 4.003 1.318"
        />
      </svg>
    ),
  },
  {
    name: 'Remote Work Opportunities',
    description:
      'Work from anywhere in the world while collaborating with US-based teams and companies.',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
        />
      </svg>
    ),
  },
  {
    name: 'Career Growth',
    description:
      'Access to professional development opportunities, mentorship, and career advancement paths.',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
  },
  {
    name: 'Work-Life Balance',
    description:
      'Flexible working hours and a culture that promotes healthy work-life integration.',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m5.801 0c-.065.21-.1.433-.1.69 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.69m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75"
        />
      </svg>
    ),
  },
];

export function BenefitsSection() {
  return (
    <div className="from-background to-muted/50 bg-gradient-to-b py-24 sm:py-20">
      <div className="mx-auto max-w-9/12 px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-primary text-base leading-7 font-semibold">
            Why Choose Us
          </h2>
          <p className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to succeed
          </p>
          <p className="text-muted-foreground mt-3 text-lg leading-8">
            We provide you with the tools, resources, and opportunities to build
            a successful career with US companies.
          </p>
        </motion.div>
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24 lg:max-w-full">
          <dl className="grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 pl-5 lg:max-w-none lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-card relative rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(110,85,207,0.2)]"
              >
                <dt className="flex flex-col items-center text-center">
                  <div className="bg-primary shadow-primary/25 flex h-10 w-10 items-center justify-center rounded-lg shadow-lg">
                    <div
                      className="text-primary-foreground h-6 w-6"
                      aria-hidden="true"
                    >
                      {benefit.icon}
                    </div>
                  </div>
                  <p className="text-foreground mt-6 text-center text-lg leading-8 font-semibold">
                    {benefit.name}
                  </p>
                </dt>
                <div>
                  <dd className="text-muted-foreground mt-4 line-clamp-5 text-center text-base leading-7">
                    {benefit.description}
                  </dd>
                </div>
                <div className="from-primary/0 via-primary/0 to-primary/0 ring-border absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 shadow-lg ring-1 transition-all duration-300 ring-inset group-hover:opacity-10" />
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
