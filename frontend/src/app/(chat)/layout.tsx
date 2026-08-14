import { PageNav } from '@/components/layout/page-nav';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageNav />
      {children}
    </>
  );
}