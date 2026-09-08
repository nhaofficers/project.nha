import type { Metadata } from 'next';
import './globals.css';
import './interface.css';
import './public.css';

export const metadata: Metadata = { title: 'জাতীয় গৃহায়ন কর্তৃপক্ষ | প্রকল্পের বাস্তব চিত্র', description: 'জাতীয় গৃহায়ন কর্তৃপক্ষের অনুমোদিত প্রকল্পভিত্তিক ডিজিটাল ফটো আর্কাইভ' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="bn"><body>{children}</body></html>; }
