'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    name: 'Create Your Profile',
    description:
      'Sign up and create a detailed profile showcasing your skills, experience, and career goals.',
    details: [
      'Upload your resume and portfolio',
      'Highlight your key skills and expertise',
      'Set your career preferences and goals',
      'Add professional certifications',
    ],
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
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    name: 'Get Matched',
    description:
      'Our AI-powered matching system connects you with relevant job opportunities from US companies.',
    details: [
      'AI analyzes your profile and preferences',
      'Matches with compatible job opportunities',
      'Receive personalized job recommendations',
      'Get notified about new matches',
    ],
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
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
  },
  {
    name: 'Interview Process',
    description:
      'Go through a streamlined interview process with our partner companies.',
    details: [
      'Initial screening with our team',
      'Technical assessment if required',
      'Video interviews with companies',
      'Final round discussions',
    ],
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
          d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
        />
      </svg>
    ),
  },
  {
    name: 'Start Your Journey',
    description:
      'Begin your new role with a US company and start building your global career.',
    details: [
      'Receive your offer letter',
      'Complete onboarding process',
      'Start working with your team',
      'Begin your global career journey',
    ],
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
];

export function ProcessSection() {
  return (
    <div id="process" className="bg-background py-24 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-primary text-base leading-7 font-semibold">
            How It Works
          </h2>
          <p className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple process to get started
          </p>
          <p className="text-muted-foreground mt-3 text-lg leading-8">
            Follow these simple steps to find your dream job with US companies.
            Our streamlined process ensures a smooth journey from profile
            creation to starting your new role.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="relative">
            {/* Horizontal timeline line */}
            <div className="from-primary via-primary/80 to-primary absolute top-[22px] left-0 h-0.5 w-full bg-gradient-to-r" />

            {/* Steps container */}
            <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-20">
              {steps.map((step, index) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex flex-col items-start text-left"
                >
                  {/* Step number and icon */}
                  <div className="mb-6">
                    <div className="from-primary to-primary/80 shadow-primary/25 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br shadow-lg transition-transform duration-300 hover:scale-110">
                      <div
                        className="text-primary-foreground h-6 w-6"
                        aria-hidden="true"
                      >
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Step content */}
                  <div>
                    <div className="text-primary mb-2 text-sm font-medium">
                      Step {index + 1}
                    </div>
                    <h3 className="text-foreground mb-3 text-xl font-semibold">
                      {step.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-base">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="text-muted-foreground flex items-center text-sm"
                        >
                          <svg
                            className="text-primary mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
