import React from 'react';
import { Check, Shield, Users } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b px-4 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
      {/* Purple background highlight */}
      <div className="absolute inset-0 top-0 flex items-center justify-center dark:hidden">
        <div
          className="bg-primary/15 h-[500px] w-[500px] rounded-full"
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

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Main Heading with gradient text and purple shadow */}
        <div className="relative mb-6">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="via-primary/90 bg-gradient-to-r from-[#6E55CF] to-[#A53BE3E5] bg-clip-text text-transparent">
              Find your perfect candidate
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mx-auto mb-2 w-[90%] max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl dark:text-gray-300">
          Transform your hiring process with our intelligent platform. Find the
          perfect candidates, streamline interviews, and build stronger teams.
        </p>
        <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl dark:text-gray-300">
          - all powered by cutting-edge AI.
        </p>

        {/* Feature badges */}
        <div className="mb-16 flex flex-wrap justify-center gap-4 sm:gap-6">
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <Check className="text-primary h-4 w-4" />
            <span>AI-Powered Matching</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <Check className="text-primary h-4 w-4" />
            <span>Lightning Fast</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <Shield className="text-primary h-4 w-4" />
            <span>Secure & Private</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <Users className="text-primary h-4 w-4" />
            <span>Verified Candidates</span>
          </div>
        </div>
      </div>
    </div>
  );
};
