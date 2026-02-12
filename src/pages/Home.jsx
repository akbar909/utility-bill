import { ArrowRight, Keyboard, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 md:py-20 px-4">
      <div className="text-center mb-16 space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
          Understand Your <br />
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Utility Bills
          </span> Instantly
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Upload a photo of your bill or enter usage details manually. Our AI will analyze costs, check for errors, and suggest ways to save using Gemini.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Upload Option */}
        <Link to="/dashboard?mode=upload" className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all cursor-pointer text-left block">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Upload size={100} className="text-primary-600" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
              <Upload size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Upload Photo</h3>
            <p className="text-slate-500">
              Take a clear picture of your electricity or gas bill. Our OCR will scan the numbers for you.
            </p>
            <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:translate-x-1 transition-transform">
              Start Upload <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Manual Entry Option */}
        <Link to="/dashboard?mode=manual" className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all cursor-pointer text-left block">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Keyboard size={100} className="text-slate-600" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Keyboard size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Manual Entry</h3>
            <p className="text-slate-500">
              Enter your unit consumption and rates manually if you don't have a photo handy.
            </p>
            <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:translate-x-1 transition-transform">
              Enter Details <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
