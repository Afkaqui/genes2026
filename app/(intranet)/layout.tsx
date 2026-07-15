import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intranet GENES Peru',
  description: 'Portal interno de GENES Peru - Acceso a certificados y recursos',
  robots: { index: false, follow: false },
};

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
