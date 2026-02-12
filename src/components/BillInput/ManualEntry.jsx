import { Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBill } from '../../context/BillContext';

const ManualEntry = () => {
  const navigate = useNavigate();
  const { updateBillData } = useBill();
  
  const [formData, setFormData] = useState({
    units: '',
    rate: '10',
    extraCharges: '',
    taxRate: '5'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBillData({
      units: parseFloat(formData.units),
      rate: parseFloat(formData.rate),
      extraCharges: parseFloat(formData.extraCharges),
      taxRate: parseFloat(formData.taxRate) / 100
    });
    navigate('/dashboard');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-lg mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Enter Bill Details</h2>
        <p className="text-slate-500">Provide your consumption details to get an analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Units Consumed (kWh/m³)
          </label>
          <input
            type="number"
            name="units"
            required
            min="0"
            step="0.01"
            value={formData.units}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. 150"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rate per Unit (PKR)
            </label>
            <input
              type="number"
              name="rate"
              required
              min="0"
              step="0.01"
              value={formData.rate}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              name="taxRate"
              required
              min="0"
              step="0.1"
              value={formData.taxRate}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Extra Charges (PKR)
          </label>
          <input
            type="number"
            name="extraCharges"
            min="0"
            step="0.01"
            value={formData.extraCharges}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Fuel Adjustment, TV Fee"
          />
        </div>

        <button type="submit" className="w-full btn-primary flex justify-center items-center gap-2 mt-4">
          <Save size={18} />
          Calculate & Analyze
        </button>
      </form>
    </div>
  );
};

export default ManualEntry;
