import { PageNav } from '@/components/layout/page-nav';

export default function InstitutionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageNav />
      {children}
    </>
  );
}