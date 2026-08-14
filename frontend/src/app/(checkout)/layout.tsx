import { PageNav } from '@/components/layout/page-nav';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageNav />
      {children}
    </>
  );
}