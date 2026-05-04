import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function AboutMissionSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-foreground text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              At Teamcast, we&apos;re on a mission to revolutionize the way
              companies build and manage their teams. We believe that finding
              the right candidate should be efficient, transparent, and
              human-centered.
            </p>
            <p className="text-muted-foreground mt-4 text-lg">
              Our AI-powered platform helps companies streamline their hiring
              process, make better hiring decisions, and create stronger teams.
              We&apos;re committed to making hiring more accessible, efficient,
              and effective for everyone.
            </p>
            <div className="mt-8">
              <Button className="bg-primary hover:bg-primary/90">
                Join Our Mission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="relative h-96 overflow-hidden rounded-lg">
            <Image
              src="/images/landing/office.jpg"
              alt="Teamcast Office"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
