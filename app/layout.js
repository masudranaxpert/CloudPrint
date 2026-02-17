import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTracker from '@/components/PageTracker';

export const metadata = {
  title: 'CloudPrint — অনলাইন PDF প্রিন্ট সার্ভিস | বাংলাদেশ',
  description: 'সবচেয়ে সাশ্রয়ী দামে আপনার PDF ফাইল প্রিন্ট করুন। সয়ংক্রিয় পৃষ্ঠা গণনা, তাৎক্ষণিক দাম জানুন, এবং WhatsApp-এ অর্ডার করুন।',
  keywords: 'pdf print, online print bangladesh, cloud print, প্রিন্ট সার্ভিস, পিডিএফ প্রিন্ট',
  openGraph: {
    title: 'CloudPrint — অনলাইন PDF প্রিন্ট সার্ভিস',
    description: 'সবচেয়ে সাশ্রয়ী দামে আপনার PDF ফাইল প্রিন্ট করুন।',
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <PageTracker />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
