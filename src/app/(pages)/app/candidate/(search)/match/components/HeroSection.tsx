import React from 'react';
import { Check, Shield } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b px-4 pt-32 sm:px-6 lg:px-8">
      {/* Purple background highlight */}
      {/* <div className="from-primary/8 via-primary/12 to-primary/8 absolute inset-0 bg-gradient-to-r blur-3xl"></div> */}

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Main Heading with gradient text and purple shadow */}
        <div className="relative mb-8">
          {/* Purple shadow behind text - Faint background effect */}
          <div className="absolute inset-0 top-0 flex items-center justify-center dark:hidden">
            <div
              className="bg-primary/15 h-[600px] w-[600px] rounded-full"
              style={{ filter: 'blur(100px)' }}
            ></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center dark:hidden">
            <div
              className="bg-primary/12 h-24 w-[600px] rounded-full"
              style={{ filter: 'blur(60px)' }}
            ></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center dark:hidden">
            <div
              className="bg-primary/18 h-16 w-[450px] rounded-full"
              style={{ filter: 'blur(65px)' }}
            ></div>
          </div>
          <h1 className="mb-8 text-5xl font-bold sm:text-6xl lg:text-7xl">
            <span className="via-primary/90 bg-gradient-to-r from-[#6E55CF] to-[#A53BE3E5] bg-clip-text text-transparent">
              Find your dream job
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="fo mx-auto w-[70%] text-lg leading-relaxed text-black sm:text-xl dark:text-white">
          Transform your hiring process with our intelligent platform. Find the
          perfect candidates, streamline interviews, and build stronger teams.
        </p>
        <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-black sm:text-xl dark:text-white">
          - all powered by cutting-edge AI.
        </p>

        {/* Feature badges */}
        <div className="mb-16 flex flex-wrap justify-center gap-6 sm:gap-8">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Check className="text-primary h-4 w-4" />
            <span>AI-Powered Matching</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Check className="text-primary h-4 w-4" />
            <span>Lightning Fast</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Shield className="text-primary h-4 w-4" />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};
