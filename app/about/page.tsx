import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Empowering Nigerian Artisans</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          NaijaSkill is Nigeria's premier platform for connecting skilled artisans with clients who value quality. 
          Born from the need to bridge the trust gap in the service industry, we provide a secure, transparent, 
          and efficient marketplace for everything from plumbing to photography.
        </p>
        <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="p-6 bg-green-50 dark:bg-slate-900 rounded-xl">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">Trust</h3>
                <p className="text-gray-600 dark:text-gray-400">Verified profiles and secure escrow payments ensure you get what you pay for.</p>
            </div>
            <div className="p-6 bg-green-50 dark:bg-slate-900 rounded-xl">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">Quality</h3>
                <p className="text-gray-600 dark:text-gray-400">Rating systems that highlight the best talent across Nigeria.</p>
            </div>
            <div className="p-6 bg-green-50 dark:bg-slate-900 rounded-xl">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">Speed</h3>
                <p className="text-gray-600 dark:text-gray-400">Find help in minutes, not days. Direct chat and instant booking.</p>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}