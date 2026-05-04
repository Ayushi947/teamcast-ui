'use client';
import * as React from 'react';
import { SVGProps } from 'react';
import { useEffect, useState } from 'react';

interface TeamcastIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string;
  secondaryColor?: string;
  width?: string | number;
  height?: string | number;
}

const TeamcastIcon = ({
  primaryColor,
  secondaryColor = '#6E55CF',
  width = 220,
  height = 45,
  ...props
}: TeamcastIconProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check if current path contains "auth" but exclude API docs pages
    const checkAuthPage = () => {
      const path = window.location.pathname;
      const isAuth =
        (path.includes('auth') || path.includes('signup')) &&
        !path.startsWith('/apis'); // Exclude API docs pages
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

  // Use provided secondaryColor or default based on auth page
  const effectiveSecondaryColor = isAuthPage ? '#ffffff' : secondaryColor;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 1339 202"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_134_5348)">
        <path
          d="M82.6719 201.96V78.63C82.6719 24.65 132.002 0.02 176.382 0.02L218.932 0C218.932 21.85 202.872 49.01 174.602 49.01C173.502 49.01 166.702 49.04 165.642 49.04C143.372 49.04 125.222 64.46 125.222 96.4V154.57C125.222 188.37 106.912 202.5 82.6719 201.96Z"
          fill="url(#paint0_linear_134_5348)"
        />
        <path
          opacity="0.32"
          d="M106.752 23.9801C92.2519 36.7701 82.6719 54.8501 82.6719 78.6301V201.96C99.9019 201.96 104.212 189.57 104.212 178.26V96.4001C104.212 59.5101 122.252 49.0401 165.632 49.0401L159.142 22.0801L106.742 23.9801H106.752Z"
          fill="url(#paint1_linear_134_5348)"
        />
        <path
          d="M65.17 49.01C65.17 21.81 85.9 0 106.64 0H0C0 22.08 16.7 49.01 47.12 49.01H65.16H65.17Z"
          fill="#121212"
        />
        <path
          d="M65.17 49.01C65.17 21.81 85.9 0 106.64 0H0C0 22.08 16.7 49.01 47.12 49.01H65.16H65.17Z"
          fill="url(#paint2_linear_134_5348)"
        />
        <path
          d="M218.932 0L176.382 0.02C132.002 0.02 82.6719 24.65 82.6719 78.63V100.36C82.6719 52.75 134.512 49.05 165.632 49.05C166.692 49.05 173.502 49.09 174.592 49.02C208.822 46.6 218.922 21.86 218.922 0.01L218.932 0Z"
          fill="url(#paint3_linear_134_5348)"
        />
        <path
          opacity="0.42"
          d="M82.6719 78.63V100.36C82.6719 -17.54 218.932 59.94 218.932 0L176.382 0.02C132.002 0.02 82.6719 24.65 82.6719 78.63Z"
          fill="url(#paint4_linear_134_5348)"
        />
        <path
          d="M67.59 0H0C0 13.47 6.23 28.74 17.98 38.6C-3.31 12.33 45.51 0 67.59 0Z"
          fill={effectivePrimaryColor}
        />
      </g>
      <path
        d="M229.795 176.072C238.647 176.072 247.731 173.455 255.185 166.91C269.394 152.512 285.699 172.408 272.655 186.282C261.707 198.062 245.867 202.25 230.494 201.989C193.924 201.989 169 175.025 169 135.759C169 92.8269 192.526 63.5077 229.795 63.5077C267.064 63.5077 288.028 90.9944 288.261 131.57C288.261 140.209 286.863 147.277 273.586 147.277H196.02C200.213 164.292 213.257 176.072 229.795 176.072ZM230.028 89.4237C211.859 89.4237 199.048 103.298 195.787 123.979H263.57C261.94 103.298 251.924 89.4237 230.028 89.4237ZM409.579 66.1254C417.498 66.1254 422.854 71.6228 422.854 79.7379V185.758C422.854 193.873 417.498 199.371 409.579 199.371C401.89 199.371 397.465 194.921 396.534 188.376C385.818 197.8 371.843 201.989 360.196 201.989C326.421 201.989 305.923 174.502 305.923 132.355C305.923 91.7798 328.983 63.5077 363.224 63.5077C373.24 63.5077 386.284 67.6961 396.534 76.5966C397.699 70.3139 402.124 66.1254 409.579 66.1254ZM362.991 175.549C376.734 175.549 390.945 168.743 396.301 155.392V110.104C390.477 97.2771 377.2 89.9473 365.088 89.9473C345.521 89.9473 332.477 107.748 332.477 132.617C332.477 158.533 344.59 175.549 362.991 175.549ZM609.177 63.5077C641.553 63.5077 660.422 89.4237 660.422 126.858V185.758C660.422 193.873 655.763 199.371 647.143 199.371C639.224 199.371 633.868 193.873 633.868 185.758V126.335C633.868 104.607 625.014 89.6855 605.449 89.6855C590.542 89.6855 570.042 105.916 570.042 134.45V185.758C570.042 193.873 565.383 199.371 557.001 199.371C549.078 199.371 543.488 193.873 543.488 185.758V126.335C543.488 104.607 534.638 89.6855 515.073 89.6855C503.193 89.6855 480.597 103.822 480.597 134.45V186.282C480.597 195.182 473.842 199.371 467.322 199.371C460.564 199.371 454.277 195.182 454.277 186.282V79.4762C454.277 72.1464 460.1 66.1254 467.322 66.1254C475.241 66.1254 480.597 72.1464 480.597 79.4762V80.2615C493.174 66.649 507.15 63.5077 519.03 63.5077C538.596 63.5077 553.039 72.9317 561.426 88.3766C575.635 68.4814 594.967 63.5077 609.177 63.5077ZM773.401 101.989C766.183 92.5651 755.931 89.162 746.614 89.162C726.117 89.162 712.609 106.439 712.609 133.141C712.609 159.057 726.585 176.072 747.549 176.072C756.866 176.072 767.114 172.669 774.566 164.292C788.078 148.847 804.15 166.648 792.503 181.046C780.389 195.968 764.084 201.989 747.315 201.989C710.28 201.989 685.822 174.502 685.822 133.403C685.822 90.9944 710.046 63.5077 746.614 63.5077C763.62 63.5077 778.293 68.4815 790.871 84.7117C802.288 99.3713 784.117 116.125 773.401 101.989ZM908.915 66.1254C916.834 66.1254 922.194 71.6228 922.194 79.7379V185.758C922.194 193.873 916.834 199.371 908.915 199.371C901.23 199.371 896.801 194.921 895.87 188.376C885.155 197.8 871.179 201.989 859.532 201.989C825.757 201.989 805.261 174.502 805.261 132.355C805.261 91.7798 828.32 63.5077 862.563 63.5077C872.577 63.5077 885.622 67.6961 895.87 76.5966C897.035 70.3139 901.46 66.1254 908.915 66.1254ZM862.329 175.549C876.071 175.549 890.281 168.743 895.637 155.392V110.104C889.813 97.2771 876.539 89.9473 864.425 89.9473C844.859 89.9473 831.814 107.748 831.814 132.617C831.814 158.533 843.928 175.549 862.329 175.549ZM941.035 168.219C938.706 158.533 946.859 151.989 954.314 151.989C959.904 151.989 964.562 155.654 966.658 162.984C969.455 172.408 983.43 176.334 996.008 176.334C1012.78 176.334 1023.96 168.743 1023.96 158.272C1023.96 147.277 1009.98 146.23 995.077 144.921C969.221 142.303 941.733 139.685 941.733 105.392C941.733 80.2615 962.696 63.5077 994.142 63.5077C1012.31 63.5077 1037.7 67.1726 1046.32 92.0415C1049.35 102.774 1040.73 109.581 1033.28 109.581C1027.69 109.581 1024.19 107.486 1021.86 101.466C1017.44 90.4709 1002.53 89.4237 994.142 89.4237C978.538 89.4237 968.29 95.9682 968.29 105.654C968.29 118.481 980.634 116.125 996.472 118.219C1022.56 121.623 1050.51 123.717 1050.51 158.272C1050.51 184.188 1028.62 201.989 996.008 201.989C976.443 201.989 947.79 197.277 941.035 168.219ZM1120.59 174.502C1131.07 167.957 1139.92 175.811 1139.92 184.973C1139.92 189.423 1137.59 194.397 1132.23 197.538C1125.25 201.727 1120.59 201.989 1113.14 201.989C1082.86 201.989 1075.63 178.167 1075.63 152.774V90.9944H1066.78C1058.16 90.9944 1053.97 84.7117 1053.97 78.6908C1053.97 72.4081 1058.4 66.1254 1066.78 66.1254H1075.63V43.6125C1075.63 34.712 1081.92 30 1088.68 30C1095.2 30 1101.95 34.712 1101.95 43.6125V66.1254H1120.12C1128.28 66.1254 1132.7 72.4081 1132.7 78.6908C1132.7 84.9735 1128.28 90.9944 1120.12 90.9944H1101.95V152.774C1101.95 164.292 1103.12 176.334 1113.14 176.334C1115.47 176.334 1118.96 175.287 1120.59 174.502ZM1156.8 171.36C1165.88 171.36 1171.71 177.643 1171.71 186.805C1171.71 195.706 1165.88 201.989 1156.8 201.989C1148.18 201.989 1141.43 195.706 1141.43 186.805C1141.43 177.643 1148.18 171.36 1156.8 171.36ZM1274.97 66.1254C1282.89 66.1254 1288.25 71.6228 1288.25 79.7379V185.758C1288.25 193.873 1282.89 199.371 1274.97 199.371C1267.28 199.371 1262.85 194.921 1261.92 188.376C1251.21 197.8 1237.23 201.989 1225.58 201.989C1191.81 201.989 1171.31 174.502 1171.31 132.355C1171.31 91.7798 1194.37 63.5077 1228.61 63.5077C1238.63 63.5077 1251.67 67.6961 1261.92 76.5966C1263.09 70.3139 1267.51 66.1254 1274.97 66.1254ZM1228.38 175.549C1242.12 175.549 1256.33 168.743 1261.69 155.392V110.104C1255.86 97.2771 1242.59 89.9473 1230.48 89.9473C1210.91 89.9473 1197.87 107.748 1197.87 132.617C1197.87 158.533 1209.98 175.549 1228.38 175.549ZM1339 46.492C1339 55.3925 1332.01 59.581 1325.49 59.581C1318.5 59.581 1311.98 55.3925 1311.98 46.492V43.0889C1311.98 34.1885 1318.5 30 1325.49 30C1332.01 30 1339 34.1885 1339 43.0889V46.492ZM1312.21 78.9526C1312.21 70.5757 1319.2 66.1254 1325.49 66.1254C1332.01 66.1254 1338.77 70.5757 1338.77 78.6908V186.544C1338.77 195.182 1332.01 199.371 1325.49 199.371C1319.2 199.371 1312.21 195.182 1312.21 186.544V78.9526Z"
        fill={effectiveSecondaryColor}
      />
      <defs>
        <linearGradient
          id="paint0_linear_134_5348"
          x1="149.462"
          y1="42.54"
          x2="151.882"
          y2="148.37"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#332667" />
          <stop offset="1" stopColor={isAuthPage ? '#ffffff' : '#6E55CF'} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_134_5348"
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
          id="paint2_linear_134_5348"
          x1="33.47"
          y1="-3.81"
          x2="89.21"
          y2="40.89"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#222222" />
          <stop offset="0.79" stopColor={effectivePrimaryColor} />
        </linearGradient>
        <linearGradient
          id="paint3_linear_134_5348"
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
          id="paint4_linear_134_5348"
          x1="232.502"
          y1="49.79"
          x2="93.5519"
          y2="50.33"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isAuthPage ? '#ffffff' : '#6E55CF'} />
          <stop offset="1" stopColor={isAuthPage ? '#ffffff' : '#5E3AB1'} />
        </linearGradient>
        <clipPath id="clip0_134_5348">
          <rect width="219" height="202" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TeamcastIcon;
