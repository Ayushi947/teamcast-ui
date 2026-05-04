'use client';
import * as React from 'react';
import { SVGProps } from 'react';
import { useEffect, useState } from 'react';

interface TeamcastShortIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string;
  width?: string | number;
  height?: string | number;
}

const TeamcastShortIcon = ({
  primaryColor,
  width = 219,
  height = 202,
  ...props
}: TeamcastShortIconProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check if current path contains "auth"
    const checkAuthPage = () => {
      const isAuth =
        window.location.pathname.includes('auth') ||
        window.location.pathname.includes('signup');
      setIsAuthPage(isAuth);
    };

    // Initial checks
    checkDarkMode();
    checkAuthPage();

    // Create observer to watch for class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listen for URL changes (for SPAs)
    const handleLocationChange = () => {
      checkAuthPage();
    };

    window.addEventListener('popstate', handleLocationChange);

    // Also check on initial load and any navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      setTimeout(checkAuthPage, 0);
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(checkAuthPage, 0);
    };

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Use provided primaryColor or default based on auth page, then dark mode
  const effectivePrimaryColor =
    primaryColor ||
    (isAuthPage ? '#ffffff' : isDarkMode ? '#ffffff' : '#121212');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 219 202"
      {...props}
    >
      <g clipPath="url(#clip0_2420_1933)">
        <path
          d="M82.6719 201.96V78.63C82.6719 24.65 132.002 0.02 176.382 0.02L218.932 0C218.932 21.85 202.872 49.01 174.602 49.01C173.502 49.01 166.702 49.04 165.642 49.04C143.372 49.04 125.222 64.46 125.222 96.4V154.57C125.222 188.37 106.912 202.5 82.6719 201.96Z"
          fill="url(#paint0_linear_2420_1933)"
        />
        <path
          opacity="0.32"
          d="M106.752 23.9801C92.2519 36.7701 82.6719 54.8501 82.6719 78.6301V201.96C99.9019 201.96 104.212 189.57 104.212 178.26V96.4001C104.212 59.5101 122.252 49.0401 165.632 49.0401L159.142 22.0801L106.742 23.9801H106.752Z"
          fill="url(#paint1_linear_2420_1933)"
        />
        <path
          d="M65.17 49.01C65.17 21.81 85.9 0 106.64 0H0C0 22.08 16.7 49.01 47.12 49.01H65.16H65.17Z"
          fill={effectivePrimaryColor}
        />
        <path
          d="M78.5 49.01C80.5 22.5 113.76 0 134.5 0H0C0 22.08 16.7 49.01 47.12 49.01H65.16H78.5Z"
          fill="url(#paint2_linear_2420_1933)"
        />
        <path
          d="M218.932 0L176.382 0.02C132.002 0.02 82.6719 24.65 82.6719 78.63V100.36C82.6719 52.75 134.512 49.05 165.632 49.05C166.692 49.05 173.502 49.09 174.592 49.02C208.822 46.6 218.922 21.86 218.922 0.01L218.932 0Z"
          fill="url(#paint3_linear_2420_1933)"
        />
        <path
          opacity="0.42"
          d="M82.6719 78.63V100.36C82.6719 -17.54 218.932 59.94 218.932 0L176.382 0.02C132.002 0.02 82.6719 24.65 82.6719 78.63Z"
          fill="url(#paint4_linear_2420_1933)"
        />
        <path
          d="M67.59 0H0C0 13.47 6.23 28.74 17.98 38.6C-3.31 12.33 45.51 0 67.59 0Z"
          fill={effectivePrimaryColor}
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_2420_1933"
          x1="149.462"
          y1="42.54"
          x2="151.882"
          y2="148.37"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isAuthPage ? '#ffffff' : '#332667'} />
          <stop offset="1" stopColor={isAuthPage ? '#ffffff' : '#6E55CF'} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2420_1933"
          x1="82.6719"
          y1="112.02"
          x2="165.632"
          y2="112.02"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isAuthPage ? '#ffffff' : '#2B2151'} />
          <stop offset="1" stopColor={isAuthPage ? '#ffffff' : '#6E55CF'} />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2420_1933"
          x1="33.47"
          y1="-3.80997"
          x2="89.21"
          y2="40.89"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#222222" />
          <stop offset="0.79" stopColor={effectivePrimaryColor} />
        </linearGradient>
        <linearGradient
          id="paint3_linear_2420_1933"
          x1="82.6719"
          y1="50.18"
          x2="218.932"
          y2="50.18"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isAuthPage ? '#ffffff' : '#6E55CF'} />
          <stop offset="1" stopColor={isAuthPage ? '#ffffff' : '#6E55CE'} />
        </linearGradient>
        <linearGradient
          id="paint4_linear_2420_1933"
          x1="232.502"
          y1="49.79"
          x2="93.5519"
          y2="50.33"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isAuthPage ? '#ffffff' : '#6E55CF'} />
          <stop offset="1" stopColor={isAuthPage ? '#ffffff' : '#5E3AB1'} />
        </linearGradient>
        <clipPath id="clip0_2420_1933">
          <rect width="219" height="202" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TeamcastShortIcon;
