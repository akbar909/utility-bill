import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ExplanationPanel from '../components/AI/ExplanationPanel';
import FileUpload from '../components/BillInput/FileUpload';
import ManualEntry from '../components/BillInput/ManualEntry';
import BillCharts from '../components/Dashboard/BillCharts';
import UsageSimulator from '../components/Dashboard/UsageSimulator';
import { useBill } from '../context/BillContext';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { billData, resetBillData } = useBill();
  const mode = searchParams.get('mode'); // 'manual' or 'upload' or null
  
  // If we have analyzed data, show the dashboard results
  // Otherwise show the input method selected
  
  const handleBack = () => {
    navigate('/');
  };

  const handleReset = () => {
    resetBillData();
    navigate('/dashboard?mode=upload'); // Default to upload or keep current mode?
  };

  if (billData.isAnalyzed) {
    return (
      <div className="max-w-6xl mx-auto py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Bill Analysis</h1>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
          >
            <RefreshCcw size={18} />
            Analyze New Bill
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Stats & Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card bg-primary-50 border-primary-100">
                <p className="text-sm text-slate-500 font-medium">Total Amount</p>
                <p className="text-3xl font-bold text-primary-700 mt-1">
                  PKR {billData.total.toLocaleString()}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-500 font-medium">Units Consumed</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {billData.units} <span className="text-sm font-normal text-slate-400">kWh</span>
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-500 font-medium">Extra Charges</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  PKR {billData.extraCharges.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="card min-h-[400px] col-span-1 md:col-span-2">
                 <h3 className="text-lg font-bold text-slate-800 mb-4">Cost Breakdown</h3>
                 <BillCharts data={billData} />
               </div>
               
               {/* Usage Simulator - taking full width or shared */}
               <div className="col-span-1 md:col-span-2">
                 <UsageSimulator billData={billData} />
               </div>
            </div>
          </div>

          {/* AI Panel */}
          <div className="lg:col-span-1">
            <ExplanationPanel />
          </div>
        </div>
      </div>
    );
  }

  // Input Selection Mode
  return (
    <div className="max-w-2xl mx-auto py-12">
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      {mode === 'manual' ? (
         <ManualEntry />
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Bill</h1>
            <p className="text-slate-500">Upload a clear photo of your utility bill for automatic analysis.</p>
          </div>
          <FileUpload />
          
          <div className="text-center">
            <p className="text-slate-400 text-sm">Or</p>
            <button 
              onClick={() => navigate('/dashboard?mode=manual')}
              className="text-primary-600 font-medium hover:underline mt-2"
            >
              Enter details manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
