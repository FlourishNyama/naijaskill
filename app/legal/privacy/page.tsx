import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12 prose dark:prose-invert">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Effective Date: December 2025</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">NaijaSkill ("we", "our") is committed to protecting your personal data in accordance with the Nigeria Data Protection Regulation (NDPR).</p>
        
        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">1. Information We Collect</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">We collect information you provide directly (Name, Email, Phone, Payment Details) and data from your use of our services (Transaction History, Messages).</p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">2. How We Use Your Data</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">We use your data to facilitate connections between Artisans and Clients, process payments via Paystack, and ensure platform safety.</p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">3. Data Security</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">We implement technical measures to protect your data. Payment data is handled securely by Paystack; we do not store full card details.</p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">4. Contact Us</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">For privacy concerns, contact us at Abuja, Nigeria or +234 806 977 0191.</p>
      </div>
      <Footer />
    </div>
  );
}