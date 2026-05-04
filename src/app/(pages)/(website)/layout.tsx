import { AnonymousChatWidget } from '@/components/help/anonymous-chat-widget';
import Navbar from './components/navbar';
import Footer from './components/footer';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AnonymousChatWidget />
    </div>
  );
}
