import { Lightbulb, Sliders, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const UsageSimulator = ({ billData }) => {
  const [reductionPercent, setReductionPercent] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [newTotal, setNewTotal] = useState(billData.total);

  useEffect(() => {
    // Simple calculation: reduce total by percentage (approximation)
    // improved logic: reduce units, recalculate base + tax
    // But for simplicity, we'll just scale the total since tax is % based too.
    const savings = billData.total * (reductionPercent / 100);
    setSavedAmount(savings);
    setNewTotal(billData.total - savings);
  }, [reductionPercent, billData.total]);

  // Tips based on reduction level
  const getTip = () => {
    if (reductionPercent === 0) return "Move the slider to see how much you could save.";
    if (reductionPercent < 10) return "Turning off lights when leaving a room can save this much.";
    if (reductionPercent < 20) return "Switching to LED bulbs and efficient fans helps significantly.";
    if (reductionPercent < 30) return "Limiting AC usage to 26°C can achieve these savings.";
    return "Major lifestyle changes or solar installation might be needed for this.";
  };

  return (
    <div className="card bg-gradient-to-br from-white to-primary-50 border-primary-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sliders size={20} className="text-primary-600" />
          Savings Simulator
        </h3>
        {reductionPercent > 0 && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full animate-fade-in">
            -{reductionPercent}% Usage
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
            <span>Current Bill</span>
            <span>Estimated New Bill</span>
          </div>
          
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-slate-400 transition-all duration-300"
              style={{ width: `${100 - reductionPercent}%` }}
            ></div>
            <div 
              className="h-full bg-green-400 transition-all duration-300 pattern-diagonal-lines"
              style={{ width: `${reductionPercent}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 font-bold">
             <span className="text-slate-500 line-through decoration-red-400">
               PKR {billData.total.toLocaleString()}
             </span>
             <span className="text-green-600 text-xl">
               PKR {newTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}
             </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Reduce Usage by {reductionPercent}%
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={reductionPercent}
            onChange={(e) => setReductionPercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-primary-100 shadow-sm flex items-start gap-3">
          <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-700 font-medium">{getTip()}</p>
            {savedAmount > 0 && (
               <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                 <TrendingDown size={12} />
                 You save PKR {savedAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} per month
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageSimulator;
