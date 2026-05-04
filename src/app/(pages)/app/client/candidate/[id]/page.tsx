'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock data - In a real app, this would come from an API
const mockCandidateData = {
  id: 1,
  name: 'Sarah Johnson',
  title: 'Senior Frontend Developer',
  intro:
    'Passionate frontend developer with a keen eye for UI/UX. Specialized in building responsive and accessible web applications with modern frameworks.',
  introVideo: 'https://example.com/intro-video.mp4', // Replace with actual video URL
  image: 'https://randomuser.me/api/portraits/women/1.jpg',
  contact: {
    email: 'sarah.johnson@example.com',
    phone: '+1 (650) 695-9495',
    website: 'https://sarahjohnson.dev',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    github: 'https://github.com/sarahjohnson',
  },
  location: 'San Francisco, CA',
  experience: 5,
  skills: [
    'React',
    'TypeScript',
    'Next.js',
    'Tailwind CSS',
    'Node.js',
    'GraphQL',
    'Jest',
    'Cypress',
  ],
  languages: ['English (Native)', 'Spanish (Professional)', 'Mandarin (Basic)'],
  summary:
    'Results-driven Senior Frontend Developer with 5+ years of experience crafting exceptional web experiences. Passionate about creating accessible, performant, and user-friendly applications using modern technologies and best practices. Strong advocate for clean code and component-driven development.',
  workExperience: [
    {
      company: 'Tech Innovators Inc.',
      position: 'Senior Frontend Developer',
      duration: '2021 - Present',
      location: 'San Francisco, CA',
      achievements: [
        'Led the frontend development of a high-traffic e-commerce platform serving 1M+ monthly users',
        'Improved application performance by 40% through code optimization and lazy loading',
        'Mentored junior developers and established frontend best practices',
      ],
    },
    {
      company: 'Digital Solutions LLC',
      position: 'Frontend Developer',
      duration: '2018 - 2021',
      location: 'Seattle, WA',
      achievements: [
        'Developed responsive web applications using React and TypeScript',
        'Implemented automated testing that increased code coverage by 65%',
        'Collaborated with UX team to improve accessibility compliance',
      ],
    },
  ],
  education: [
    {
      institution: 'Stanford University',
      degree: 'BS Computer Science',
      duration: '2014 - 2018',
      achievements: [
        'Graduated with Honors',
        'Senior thesis on Web Accessibility Patterns',
        'Teaching Assistant for Web Development course',
      ],
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      year: 2022,
    },
    {
      name: 'Professional Web Accessibility',
      issuer: 'International Association of Accessibility Professionals',
      year: 2021,
    },
  ],
  projects: [
    {
      name: 'E-commerce Platform Redesign',
      description:
        'Led the complete redesign and implementation of a modern e-commerce platform using Next.js and GraphQL',
      technologies: ['Next.js', 'GraphQL', 'Tailwind CSS', 'Stripe'],
      link: 'https://example.com/project1',
    },
    {
      name: 'Accessibility Testing Tool',
      description:
        'Developed an open-source tool for automated accessibility testing in React applications',
      technologies: ['React', 'TypeScript', 'Jest'],
      link: 'https://github.com/example/project2',
    },
  ],
};

const CandidateProfilePage = () => {
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // In a real app, fetch data based on params.id
  const candidate = mockCandidateData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Matches
      </Button>

      {/* Header Section */}
      <div className="mb-8 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={candidate.image}
            alt={candidate.name}
            width={96}
            height={96}
            className="border-primary/10 h-24 w-24 rounded-full border-4 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">{candidate.name}</h1>
            <p className="text-muted-foreground text-lg">{candidate.title}</p>
            <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {candidate.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {candidate.experience} years
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button>Contact</Button>
          <Button variant="outline">Download Resume</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Video and Contact */}
        <div className="space-y-6">
          {/* Intro Video */}
          <div className="bg-card overflow-hidden rounded-lg border">
            <div className="relative aspect-video">
              {isVideoPlaying ? (
                <video
                  controls
                  autoPlay
                  className="h-full w-full object-cover"
                  src={candidate.introVideo}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div
                  className="relative h-full w-full cursor-pointer"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <Image
                    width={96}
                    height={96}
                    src={candidate.image}
                    alt="Video thumbnail"
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                  <p className="absolute bottom-4 left-4 text-lg font-semibold text-white">
                    Watch Intro Video
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
            <div className="space-y-3">
              <a
                href={`mailto:${candidate.contact.email}`}
                className="hover:text-primary flex items-center gap-2 text-sm"
              >
                <Mail className="h-4 w-4" />
                {candidate.contact.email}
              </a>
              <a
                href={`tel:${candidate.contact.phone}`}
                className="hover:text-primary flex items-center gap-2 text-sm"
              >
                <Phone className="h-4 w-4" />
                {candidate.contact.phone}
              </a>
              {candidate.contact.website && (
                <a
                  href={candidate.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-2 text-sm"
                >
                  <Globe className="h-4 w-4" />
                  Personal Website
                </a>
              )}
              <a
                href={candidate.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary flex items-center gap-2 text-sm"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn Profile
              </a>
              <a
                href={candidate.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary flex items-center gap-2 text-sm"
              >
                <Github className="h-4 w-4" />
                GitHub Profile
              </a>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Languages</h2>
            <div className="space-y-2">
              {candidate.languages.map((language) => (
                <div key={language} className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4" />
                  {language}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Resume Content */}
        <div className="col-span-2 space-y-6">
          {/* Professional Summary */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Professional Summary</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {candidate.summary}
            </p>
          </div>

          {/* Work Experience */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-6 text-lg font-semibold">Work Experience</h2>
            <div className="space-y-6">
              {candidate.workExperience.map((experience, index) => (
                <div
                  key={index}
                  className="border-muted relative border-l pl-6"
                >
                  <div className="bg-background absolute top-0 -left-2 rounded-full border p-1">
                    <Building className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">{experience.position}</h3>
                  <p className="text-muted-foreground text-sm">
                    {experience.company}
                  </p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {experience.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {experience.location}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {experience.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="text-primary mt-1 h-4 w-4 shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-6 text-lg font-semibold">Education</h2>
            <div className="space-y-6">
              {candidate.education.map((edu, index) => (
                <div
                  key={index}
                  className="border-muted relative border-l pl-6"
                >
                  <div className="bg-background absolute top-0 -left-2 rounded-full border p-1">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-muted-foreground text-sm">
                    {edu.institution}
                  </p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    {edu.duration}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {edu.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="text-primary mt-1 h-4 w-4 shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-6 text-lg font-semibold">Certifications</h2>
            <div className="space-y-4">
              {candidate.certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Award className="text-primary mt-1 h-5 w-5" />
                  <div>
                    <h3 className="font-medium">{cert.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {cert.issuer} • {cert.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-6 text-lg font-semibold">Notable Projects</h2>
            <div className="space-y-6">
              {candidate.projects.map((project, index) => (
                <div
                  key={index}
                  className="border-muted relative border-l pl-6"
                >
                  <div className="bg-background absolute top-0 -left-2 rounded-full border p-1">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {project.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-2 block text-sm hover:underline"
                  >
                    View Project →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
