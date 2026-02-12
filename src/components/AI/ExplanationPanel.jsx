import { Key, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useBill } from '../../context/BillContext';
import { generateExplanation } from '../../services/gemini';

const ExplanationPanel = () => {
  const { billData } = useBill();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  // You can paste your API Key directly here for the hackathon
  // e.g. useState("AIzaSyB...")
  const [apiKey, setApiKey] = useState("AIzaSyBm9TVWNST8lWXqatd3D_KITrLSEDgakA4");
  const [error, setError] = useState(null);

  const handleExplain = async () => {
    if (!apiKey) {
      setError("Please enter a valid Gemini API Key first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const text = await generateExplanation(billData, apiKey);
      setResponse(text);
    } catch (err) {
      // Show error but don't block - demo mode handles this
      console.error(err);
      setError("API connection issue - check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-full flex flex-col min-h-[500px] border-primary-100 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-32 bg-primary-50 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-amber-400 fill-amber-400" />
          AI Assistant
        </h3>

        {/* Chat Area */}
        <div className="flex-grow bg-slate-50/50 rounded-xl p-4 mb-4 overflow-y-auto space-y-4 border border-slate-100">
          {!response && !loading && (
            <div className="text-center text-slate-400 mt-10">
              <Sparkles size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Click "Explain My Bill" to get an AI analysis of your usage.</p>
            </div>
          )}

          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-primary-600" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <div className="flex gap-1 h-5 items-center">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          {response && (
            <div className="flex gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-primary-600" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-slate-700 text-sm leading-relaxed">
                {response}
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {!apiKey && !response && (
             <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg border border-amber-100 mb-2">
               <Key size={14} className="text-amber-500" />
               <input 
                 type="password" 
                 placeholder="Enter Gemini API Key" 
                 className="bg-transparent text-sm w-full outline-none text-slate-700 placeholder:text-slate-400"
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
               />
             </div>
          )}
          
          <button 
            onClick={handleExplain}
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            {loading ? 'Analyzing...' : 'Explain My Bill'}
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel;
