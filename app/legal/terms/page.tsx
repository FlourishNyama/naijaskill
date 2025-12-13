import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12 prose dark:prose-invert">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Terms of Service</h1>
        
        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">1. Acceptance of Terms</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">By using NaijaSkill, you agree to these terms. If you do not agree, please do not use the platform.</p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">2. User Responsibilities</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">You agree to provide accurate information. Artisans must perform work professionally. Clients must pay for satisfactory work.</p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">3. Payments & Escrow</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">All payments must go through the platform. Attempts to pay off-platform will result in account suspension.</p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">4. Limitation of Liability</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">NaijaSkill connects users but does not oversee the actual work. We are not liable for damages resulting from job execution.</p>
      </div>
      <Footer />
    </div>
  );
}