import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | Teamcast',
  description:
    "Find answers to your questions and learn how to make the most of Teamcast's AI-powered hiring platform. Comprehensive guides for clients, candidates, and partners.",
  keywords:
    'teamcast help, hiring platform guide, AI recruitment help, candidate guide, client support, job search help',
  openGraph: {
    title: 'Teamcast Help Center',
    description:
      "Complete guides and documentation for using Teamcast's AI-powered hiring platform",
    type: 'website',
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="pt-16 pb-16">{children}</div>
    </div>
  );
}
