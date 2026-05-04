'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApp } from '@/lib/context/app-context';
import {
  ChevronDown,
  Menu,
  Newspaper,
  X,
  Users,
  Zap,
  ArrowRight,
  LogIn,
  BellElectric,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TeamcastIcon } from '@/components/icons';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const { user } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const isCandidatePage = pathname.startsWith('/candidate');

  const handleCandidateSignIn = () => {
    router.push('/app/auth/login?user_type=candidate');
  };

  const handleClientSignIn = () => {
    router.push('/app/auth/login?user_type=client');
  };

  const handleDashboard = () => {
    if (!user) return;

    if (user.type === 'PARTNER' && user.role === 'PARTNER_RESOURCE') {
      router.push('/app/candidate/dashboard');
      return;
    }

    // Navigate based on user type
    switch (user.type) {
      case 'CLIENT':
        router.push('/app/client/dashboard');
        break;
      case 'CANDIDATE':
        router.push('/app/candidate/dashboard');
        break;
      case 'PARTNER':
        router.push('/app/partner/dashboard');
        break;
      case 'SUPPORT':
        router.push('/app/support/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  // Close resources dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resourcesRef.current &&
        !resourcesRef.current.contains(event.target as Node)
      ) {
        setIsResourcesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Animation variants for dropdown
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: 'easeIn' as const,
      },
    },
  };

  const candidateResourcesItems = [
    { href: '/blog', label: 'Blog', icon: Newspaper },
    { href: '/careers', label: 'Careers', icon: Users },
  ];

  const clientResourcesItems = [
    {
      href: '/demo',
      label: 'AI Interview Demo',
      icon: BellElectric,
    },
    {
      href: '/features',
      label: 'Features',
      icon: Zap,
    },
    { href: '/blog', label: 'Blog', icon: Newspaper },
    { href: '/careers', label: 'Careers', icon: Users },
  ];

  const resourcesItems = isCandidatePage
    ? candidateResourcesItems
    : clientResourcesItems;

  return (
    <TooltipProvider>
      <nav className="border-border bg-background/30 fixed top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="mx-auto max-w-[88vw] px-4 sm:px-6 lg:px-8">
          <div className="grid h-14 w-full grid-cols-2 items-center md:h-20 md:grid-cols-3">
            {/* Logo - Extreme Left */}
            <div className="flex items-center justify-start">
              <Link href="/" className="flex items-center">
                <TeamcastIcon className="h-10 w-auto" />
              </Link>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex md:items-center md:justify-center md:space-x-6">
              {isCandidatePage ? (
                <>
                  <div className="relative" ref={resourcesRef}>
                    <button
                      onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                      className="hover:bg-muted hover:text-primary text-foreground flex cursor-pointer items-center rounded-md px-2 py-1 text-sm font-medium"
                    >
                      Resources
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isResourcesOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          className="border-border bg-background/90 absolute right-0 mt-6 w-56 origin-top-right rounded-lg border p-1 shadow-lg backdrop-blur-sm focus:outline-none"
                        >
                          {resourcesItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="text-muted-foreground hover:bg-muted hover:text-primary flex items-center gap-2 rounded-md px-4 py-2.5 text-sm transition-colors"
                                onClick={() => setIsResourcesOpen(false)}
                              >
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Link
                    href="/about"
                    className="hover:text-primary text-foreground text-sm font-medium"
                  >
                    About Us
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="hover:text-primary text-foreground p-3 text-sm font-medium"
                  >
                    Pricing
                  </Link>
                  <div className="relative" ref={resourcesRef}>
                    <button
                      onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                      className="hover:bg-muted hover:text-primary text-foreground flex cursor-pointer items-center rounded-md px-2 py-1 text-sm font-medium"
                    >
                      Resources
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isResourcesOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          className="border-border bg-background/90 absolute right-0 mt-6 w-56 origin-top-right rounded-lg border p-1 shadow-lg backdrop-blur-sm focus:outline-none"
                        >
                          {resourcesItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="text-muted-foreground hover:bg-muted hover:text-primary flex items-center gap-2 rounded-md px-4 py-2.5 text-sm transition-colors"
                                onClick={() => setIsResourcesOpen(false)}
                              >
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Link
                    href="/about"
                    className="hover:text-primary text-foreground text-sm font-medium"
                  >
                    About Us
                  </Link>
                </>
              )}
            </div>

            {/* Right Section - Theme Toggle & Buttons (Desktop) / Mobile Menu (Mobile) */}
            <div className="flex items-center justify-end">
              {/* Desktop Right Section */}
              <div className="hidden md:flex md:items-center md:space-x-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ThemeToggle />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Theme</p>
                  </TooltipContent>
                </Tooltip>
                {user ? (
                  <Button
                    variant="outline"
                    className="border-border bg-background text-foreground hover:bg-muted"
                    onClick={handleDashboard}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    {isCandidatePage ? (
                      <Button
                        size="sm"
                        className="cursor-pointer bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
                        onClick={handleCandidateSignIn}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="cursor-pointer bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
                        onClick={handleClientSignIn}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    )}
                  </>
                )}

                {isCandidatePage ? (
                  <Link href="/">
                    <Button
                      size="sm"
                      className="cursor-pointer bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Hire Talent
                    </Button>
                  </Link>
                ) : (
                  <Link href="/candidate">
                    <Button
                      size="sm"
                      className="cursor-pointer bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Find Jobs
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-primary inline-flex cursor-pointer items-center justify-center rounded-md p-2 focus:ring-2 focus:outline-none focus:ring-inset"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="border-border bg-background space-y-1 border-t px-2 pt-2 pb-3">
              {isCandidatePage ? (
                <>
                  <div className="px-2">
                    <button
                      onClick={() =>
                        setIsMobileResourcesOpen(!isMobileResourcesOpen)
                      }
                      className="hover:bg-muted hover:text-primary text-foreground flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-base font-medium"
                    >
                      <span>Resources</span>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 ${isMobileResourcesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isMobileResourcesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-muted mt-1 overflow-hidden rounded-md"
                        >
                          {resourcesItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="text-muted-foreground hover:bg-muted/80 hover:text-primary flex items-center gap-3 px-4 py-3 text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <Icon className="h-5 w-5" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Link
                    href="/about"
                    className="hover:bg-muted hover:text-primary text-foreground block rounded-md px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="hover:bg-muted hover:text-primary text-foreground block rounded-md px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <div className="px-2">
                    <button
                      onClick={() =>
                        setIsMobileResourcesOpen(!isMobileResourcesOpen)
                      }
                      className="hover:bg-muted hover:text-primary text-foreground flex w-full cursor-pointer items-center justify-between rounded-md py-2 text-base font-medium"
                    >
                      <span>Resources</span>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 ${isMobileResourcesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isMobileResourcesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-muted mt-1 overflow-hidden rounded-md"
                        >
                          {resourcesItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="hover:bg-muted hover:text-primary text-foreground flex items-center gap-3 px-4 py-3 text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <Icon className="h-5 w-5" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Link
                    href="/about"
                    className="hover:bg-muted hover:text-primary text-foreground block rounded-md px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </>
              )}
              <div className="mt-4 space-y-2 px-3">
                {user ? (
                  <Button
                    variant="outline"
                    className="border-border bg-background text-foreground hover:bg-muted mb-2 w-full"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDashboard();
                    }}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    {isCandidatePage ? (
                      <Button
                        variant="outline"
                        className="border-border bg-background text-foreground hover:bg-muted mb-2 w-full"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleCandidateSignIn();
                        }}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In as Candidate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-border bg-background text-foreground hover:bg-muted mb-2 w-full"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleClientSignIn();
                        }}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In as Employer
                      </Button>
                    )}
                  </>
                )}
                {!isCandidatePage && (
                  <Link href="/demo" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="mb-2 w-full border-[#6e55cf]/30 text-[#6e55cf] hover:border-[#6e55cf] hover:bg-[#6e55cf]/10"
                    >
                      <BellElectric className="mr-2 h-4 w-4" />
                      Try AI Interview Demo
                    </Button>
                  </Link>
                )}
                {isCandidatePage ? (
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full cursor-pointer bg-[#6e55cf] hover:bg-[#5a4ba8]">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Hire Talent
                    </Button>
                  </Link>
                ) : (
                  <Link href="/candidate" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full cursor-pointer bg-[#6e55cf] hover:bg-[#5a4ba8]">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Find Jobs
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}

export default Navbar;
