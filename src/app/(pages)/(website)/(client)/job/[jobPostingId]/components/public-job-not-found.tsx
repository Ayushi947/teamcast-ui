import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Home, Briefcase } from 'lucide-react';
import Link from 'next/link';

export const PublicJobNotFound: React.FC = () => {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Background pattern */}
      <div className="bg-grid-pattern pointer-events-none fixed inset-0 opacity-[0.02]" />

      <div className="relative">
        {/* Navigation padding for fixed header */}
        <div className="h-14 md:h-16" />

        {/* Main content */}
        <div className="mx-auto w-[70%] px-3 pb-12 sm:px-4 lg:px-6">
          <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="w-full max-w-md text-center shadow-lg">
              <CardHeader className="space-y-4">
                <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                  <Search className="text-muted-foreground h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Job Not Found
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Sorry, the job posting you&apos;re looking for doesn&apos;t
                  exist or may have been removed.
                </p>

                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Go to Homepage
                    </Link>
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link href="/jobs">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Browse Other Jobs
                    </Link>
                  </Button>
                </div>

                <p className="text-muted-foreground text-xs">
                  If you believe this is an error, please contact our support
                  team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
