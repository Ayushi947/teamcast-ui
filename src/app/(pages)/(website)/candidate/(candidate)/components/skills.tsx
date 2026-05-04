'use client';

import { motion } from 'framer-motion';

const skills = [
  {
    category: 'Programming Languages',
    items: ['JavaScript', 'Python', 'Java', 'Go', 'Rust', 'TypeScript'],
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
  },
  {
    category: 'Frontend Development',
    items: ['React', 'Next.js', 'Vue.js', 'Angular', 'Tailwind CSS', 'Webpack'],
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    category: 'Backend Development',
    items: [
      'Node.js',
      'Django',
      'Spring Boot',
      'Express',
      'GraphQL',
      'MongoDB',
    ],
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    ),
  },
  {
    category: 'Cloud & DevOps',
    items: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git'],
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
  },
  {
    category: 'AI & Machine Learning',
    items: [
      'TensorFlow',
      'PyTorch',
      'Scikit-learn',
      'NLP',
      'Computer Vision',
      'Deep Learning',
    ],
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    category: 'Mobile Development',
    items: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'],
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export function SkillsSection() {
  return (
    <div className="from-muted/50 to-background relative overflow-hidden bg-gradient-to-b py-16 sm:py-20">
      <div className="bg-grid-pattern absolute inset-0 opacity-5" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium"
          >
            In-Demand Skills
          </motion.span>
          <h2 className="text-foreground mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Skills US Companies Are Looking For
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-7">
            Discover the most sought-after skills and technologies in the US job
            market.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:mt-20 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 space-y-9 pl-10 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-md p-2 transition-colors duration-300">
                    {skillGroup.icon}
                  </div>
                  <h3 className="text-foreground group-hover:text-primary text-lg font-semibold transition-colors duration-300">
                    {skillGroup.category}
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-1">
                  {skillGroup.items.map((skill) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                      className="text-muted-foreground group-hover:text-foreground flex items-center gap-x-2 text-sm leading-6 transition-colors duration-300"
                    >
                      <svg
                        className="text-primary group-hover:text-primary/80 h-4 w-4 flex-none transition-colors duration-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {skill}
                    </motion.div>
                  ))}
                </div>
                <div className="from-primary/0 via-primary/0 to-primary/0 absolute -inset-x-3 -inset-y-4 rounded-md bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
