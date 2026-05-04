'use client';

import Image from 'next/image';

const team = [
  {
    name: 'John Gengarella',
    role: 'Co-Founder & CEO',
    image: '/images/team/john.jpg',
    bio: 'John Gengarella is a veteran SaaS leader with multiple successful exits and deep enterprise experience. He served as CEO at multiple venture-backed companies.',
  },
  // {
  //   name: 'Yogi Kandlikar',
  //   role: 'Co-Founder & CTO',
  //   image: '/images/team/yogi.jpg',
  //   bio: 'Yogi Kandlikar focuses on scaling cloud-native platforms and championing technical excellence in enterprise software. His passion is building scalable systems.',
  // },
  {
    name: 'Utkarsh Wagh',
    role: 'Co-Founder & CDO',
    image: '/images/team/utkarsh.jpg',
    bio: 'Utkarsh Wagh, brings deep experience in scaling tech teams, product innovation, and global talent platforms- Driving the shift toward smarter, faster, and more human-centric work.',
  },
  {
    name: 'Vitesh Jaiswal',
    role: 'India Head',
    image: '/images/team/vitesh.png',
    bio: 'Vitesh Jaiswal spearheads India team and technical strategy leveraging his strong background in technology and innovation. ',
  },
  {
    name: 'Vijay Khade',
    role: 'Technical Architect',
    image: '/images/team/vijay.jpg',
    bio: 'Vijay Khade, specializes in scalable system design and leads end-to-end architecture with a focus on innovation and performance.',
  },
];

export function AboutTeamSection() {
  return (
    <>
      <style jsx global>{`
        @keyframes team-float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes team-float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }
        @keyframes team-wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(1deg);
          }
          75% {
            transform: rotate(-1deg);
          }
        }
        @keyframes team-spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes team-reverse-spin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes team-pulse-glow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        @keyframes team-orbit {
          0% {
            transform: rotate(0deg) translateX(60px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(60px) rotate(-360deg);
          }
        }
        @keyframes team-orbit-reverse {
          0% {
            transform: rotate(360deg) translateX(50px) rotate(-360deg);
          }
          100% {
            transform: rotate(0deg) translateX(50px) rotate(0deg);
          }
        }
        @keyframes team-wave {
          0%,
          100% {
            height: 4px;
          }
          50% {
            height: 8px;
          }
        }
        @keyframes team-ripple {
          0% {
            height: 4px;
            box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            height: 6px;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
          }
          100% {
            height: 4px;
            box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
          }
        }
        @keyframes team-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes team-slide-in-up {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes team-bounce-sequence {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .team-animate-float {
          animation: team-float 6s ease-in-out infinite;
        }
        .team-animate-float-delayed {
          animation: team-float-delayed 8s ease-in-out infinite;
        }
        .team-animate-wiggle {
          animation: team-wiggle 2s ease-in-out infinite;
        }
        .team-animate-spin-slow {
          animation: team-spin-slow 20s linear infinite;
        }
        .team-animate-reverse-spin {
          animation: team-reverse-spin 15s linear infinite;
        }
        .team-animate-pulse-glow {
          animation: team-pulse-glow 3s ease-in-out infinite;
        }
        .team-animate-orbit {
          animation: team-orbit 4s linear infinite;
        }
        .team-animate-orbit-reverse {
          animation: team-orbit-reverse 6s linear infinite;
        }
        .team-animate-wave {
          animation: team-wave 1s ease-in-out infinite;
        }
        .team-animate-ripple {
          animation: team-ripple 1.5s ease-in-out infinite;
        }
        .team-animate-fade-in-up {
          animation: team-fade-in-up 0.8s ease-out forwards;
        }
        .team-animate-slide-in-up {
          animation: team-slide-in-up 0.8s ease-out forwards;
        }
        .team-animate-bounce-sequence {
          animation: team-bounce-sequence 2s ease-in-out infinite;
        }
        .team-animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <section className="from-muted via-background to-muted relative overflow-hidden bg-gradient-to-br py-24">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-primary/5 team-animate-float absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl"></div>
          <div className="bg-secondary/5 team-animate-float-delayed absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl"></div>
          <div className="bg-accent/3 team-animate-pulse-slow absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header with creative styling */}
          <div className="mb-20 text-center">
            <div className="bg-primary/10 team-animate-fade-in-up mb-6 inline-flex items-center justify-center rounded-full px-6 py-2">
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                Our Leadership
              </span>
            </div>
            <h2
              className="from-foreground via-foreground to-muted-foreground team-animate-fade-in-up mb-6 bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent sm:text-6xl"
              style={{ animationDelay: '100ms' }}
            >
              Meet Our Team
            </h2>
            <p
              className="text-muted-foreground team-animate-fade-in-up mx-auto max-w-3xl text-xl leading-relaxed"
              style={{ animationDelay: '200ms' }}
            >
              The visionary minds driving innovation and excellence at Teamcast,
              <br className="hidden sm:block" />
              transforming the future of hiring and talent management
            </p>
          </div>

          {/* Creative centered grid layout with special positioning */}
          <div className="flex flex-col items-center space-y-12">
            {/* First row - 3 items */}
            <div className="grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {team.slice(0, 3).map((member, index) => (
                <div
                  key={member.name}
                  className="group team-animate-slide-in-up relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Main card with creative design */}
                  <div className="bg-card/80 border-border/50 group-hover:bg-card relative overflow-hidden rounded-3xl border p-8 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-6 hover:scale-105 hover:shadow-2xl">
                    {/* Animated gradient overlay */}
                    <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                    {/* Creative image container */}
                    <div className="relative mb-8 flex justify-center">
                      <div className="group-hover:team-animate-wiggle relative">
                        {/* Animated background rings with different effects */}
                        <div className="from-primary/20 to-secondary/20 team-animate-spin-slow absolute inset-0 scale-110 rounded-full bg-gradient-to-br transition-transform duration-500 group-hover:scale-125"></div>
                        <div className="from-accent/20 to-primary/10 team-animate-reverse-spin absolute inset-0 scale-105 rounded-full bg-gradient-to-tl transition-transform delay-100 duration-700 group-hover:scale-120"></div>

                        {/* Main image */}
                        <div className="group-hover:border-primary/30 relative h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow-2xl transition-colors duration-300">
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                            sizes="144px"
                            priority
                          />
                        </div>

                        {/* Multiple floating accents */}
                        <div className="bg-primary absolute -top-2 -right-2 h-6 w-6 animate-bounce rounded-full opacity-0 shadow-lg transition-all delay-200 duration-300 group-hover:opacity-100"></div>
                        <div className="bg-secondary absolute -bottom-2 -left-2 h-4 w-4 animate-ping rounded-full opacity-0 shadow-lg transition-all delay-400 duration-300 group-hover:opacity-100"></div>
                      </div>
                    </div>

                    {/* Content with enhanced typography */}
                    <div className="relative space-y-4 text-center">
                      <h3 className="text-foreground group-hover:text-primary text-2xl font-bold transition-colors duration-300 group-hover:animate-pulse">
                        {member.name}
                      </h3>

                      <div className="bg-primary/10 group-hover:bg-primary/20 inline-flex items-center justify-center rounded-full px-4 py-1 transition-colors duration-300">
                        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                          {member.role}
                        </p>
                      </div>

                      <p className="text-muted-foreground group-hover:text-foreground/80 text-sm leading-relaxed transition-colors duration-300">
                        {member.bio}
                      </p>
                    </div>

                    {/* Bottom accent line with wave effect */}
                    <div className="from-primary to-secondary group-hover:team-animate-wave absolute bottom-0 left-1/2 h-1 w-0 bg-gradient-to-r transition-all duration-500 ease-out group-hover:left-0 group-hover:w-full"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Second row - 2 items centered */}
            <div className="flex justify-center">
              <div className="grid max-w-sm grid-cols-1 gap-8 md:grid-cols-1 lg:gap-16">
                {team.slice(3).map((member, index) => (
                  <div
                    key={member.name}
                    className="group team-animate-slide-in-up relative"
                    style={{ animationDelay: `${(index + 3) * 150}ms` }}
                  >
                    {/* Main card with same creative design as first row */}
                    <div className="bg-card/80 border-border/50 group-hover:bg-card relative overflow-hidden rounded-3xl border p-8 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-6 hover:scale-105 hover:shadow-2xl">
                      {/* Animated gradient overlay */}
                      <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                      {/* Creative image container */}
                      <div className="relative mb-8 flex justify-center">
                        <div className="group-hover:team-animate-wiggle relative">
                          {/* Animated background rings with different effects */}
                          <div className="from-primary/20 to-secondary/20 team-animate-spin-slow absolute inset-0 scale-110 rounded-full bg-gradient-to-br transition-transform duration-500 group-hover:scale-125"></div>
                          <div className="from-accent/20 to-primary/10 team-animate-reverse-spin absolute inset-0 scale-105 rounded-full bg-gradient-to-tl transition-transform delay-100 duration-700 group-hover:scale-120"></div>

                          {/* Main image */}
                          <div className="group-hover:border-primary/30 relative h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow-2xl transition-colors duration-300">
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover object-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                              sizes="144px"
                              priority
                            />
                          </div>

                          {/* Multiple floating accents */}
                          <div className="bg-primary absolute -top-2 -right-2 h-6 w-6 animate-bounce rounded-full opacity-0 shadow-lg transition-all delay-200 duration-300 group-hover:opacity-100"></div>
                          <div className="bg-secondary absolute -bottom-2 -left-2 h-4 w-4 animate-ping rounded-full opacity-0 shadow-lg transition-all delay-400 duration-300 group-hover:opacity-100"></div>
                        </div>
                      </div>

                      {/* Content with enhanced typography */}
                      <div className="relative space-y-4 text-center">
                        <h3 className="text-foreground group-hover:text-primary text-2xl font-bold transition-colors duration-300 group-hover:animate-pulse">
                          {member.name}
                        </h3>

                        <div className="bg-primary/10 group-hover:bg-primary/20 inline-flex items-center justify-center rounded-full px-4 py-1 transition-colors duration-300">
                          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                            {member.role}
                          </p>
                        </div>

                        <p className="text-muted-foreground group-hover:text-foreground/80 text-sm leading-relaxed transition-colors duration-300">
                          {member.bio}
                        </p>
                      </div>

                      {/* Bottom accent line with wave effect */}
                      <div className="from-primary to-secondary group-hover:team-animate-wave absolute bottom-0 left-1/2 h-1 w-0 bg-gradient-to-r transition-all duration-500 ease-out group-hover:left-0 group-hover:w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
