import { PageNav } from '@/components/layout/page-nav';

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageNav />
      {children}
    </>
  );
}