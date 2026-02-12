import { AlertCircle, CheckCircle, FileText, Flame, Loader2, RefreshCw, Upload, X, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBill } from '../../context/BillContext';
import { extractBillFromImage } from '../../services/gemini';
import { parseBillText } from '../../services/ocr';
import { extractTextFromPDF, validateBillContent } from '../../services/pdf';

const FileUpload = () => {
  const navigate = useNavigate();
  const { updateBillData } = useBill();
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (selectedFile) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      return 'Invalid file type. Please upload a JPG, PNG, WEBP image, or PDF.';
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      return 'File is too large. Please upload a file smaller than 10MB.';
    }

    return null;
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setExtractedData(null);
    setIsProcessing(false);
    setProcessingStatus('');
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
    
    // Create preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview({ type: 'image', url: reader.result });
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === 'application/pdf') {
      setPreview({ type: 'pdf', name: selectedFile.name });
    }

    setIsProcessing(true);

    try {
      let data = null;

      if (selectedFile.type.startsWith('image/')) {
        // Use Gemini Vision AI for images - much smarter than OCR
        setProcessingStatus('🤖 AI is reading your bill...');
        data = await extractBillFromImage(selectedFile);
        
        if (!data.isValidBill) {
          setError('This image does not appear to be a utility bill. Please upload a valid electricity or gas bill.');
          setIsProcessing(false);
          return;
        }

      } else if (selectedFile.type === 'application/pdf') {
        // For PDFs, extract text first then parse
        setProcessingStatus('📄 Extracting text from PDF...');
        const text = await extractTextFromPDF(selectedFile);
        
        if (!validateBillContent(text)) {
          setError('This PDF does not appear to be a utility bill. Please upload a valid electricity or gas bill.');
          setIsProcessing(false);
          return;
        }

        setProcessingStatus('🔍 Parsing bill data...');
        const parsed = parseBillText(text);
        
        data = {
          billType: 'electricity',
          company: '',
          units: parsed.units,
          total: parsed.total,
          currentBill: parsed.currentBill || 0,
          afterDueDate: parsed.afterDueDate || 0,
          dueDate: parsed.dueDate || '',
          billMonth: parsed.billMonth || '',
          referenceNumber: parsed.referenceNumber || '',
          meterNumber: '',
          consumerName: '',
          arrears: 0,
          taxes: parsed.tax || 0,
          fuelAdjustment: 0,
          isValidBill: true,
        };
      }

      if (!data || (data.units === 0 && data.total === 0)) {
        setError('Could not extract bill data. Please try again or use manual entry.');
        setIsProcessing(false);
        return;
      }

      setExtractedData(data);
      setIsProcessing(false);
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Failed to process file. Please try again or enter details manually.');
      setIsProcessing(false);
    }
  };

  const confirmAndNavigate = () => {
    if (extractedData) {
      updateBillData({
        units: extractedData.units,
        total: extractedData.total,
        rate: extractedData.units > 0 ? parseFloat((extractedData.total / extractedData.units).toFixed(2)) : 0,
        dueDate: extractedData.dueDate,
        referenceNumber: extractedData.referenceNumber,
        billMonth: extractedData.billMonth,
        currentBill: extractedData.currentBill,
        afterDueDate: extractedData.afterDueDate,
        billType: extractedData.billType,
        company: extractedData.company,
        consumerName: extractedData.consumerName,
        meterNumber: extractedData.meterNumber,
        arrears: extractedData.arrears,
        taxes: extractedData.taxes,
        fuelAdjustment: extractedData.fuelAdjustment,
      });
      navigate('/dashboard');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const BillTypeIcon = extractedData?.billType === 'gas' ? Flame : Zap;
  const billTypeColor = extractedData?.billType === 'gas' ? 'text-orange-500' : 'text-yellow-500';

  return (
    <div className="max-w-xl mx-auto">
      <div 
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 scale-[1.02]' 
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          }
          ${isProcessing ? 'pointer-events-none opacity-80' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !preview && document.getElementById('file-upload').click()}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              {preview.type === 'image' ? (
                <img 
                  src={preview.url} 
                  alt="Bill preview" 
                  className="max-h-64 rounded-lg border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="bg-slate-100 p-8 rounded-lg border border-slate-200 shadow-sm">
                  <FileText size={64} className="text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">{preview.name}</p>
                  <p className="text-xs text-slate-400 mt-1">PDF Document</p>
                </div>
              )}
              {!isProcessing && !extractedData && (
                <button
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary-600">
                <Loader2 size={20} className="animate-spin" />
                <span className="font-medium">{processingStatus}</span>
              </div>
            )}

            {extractedData && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">Bill data extracted successfully!</span>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 text-left space-y-3">
                  {/* Bill Type & Company */}
                  {extractedData.company && (
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <BillTypeIcon size={18} className={billTypeColor} />
                      <span className="font-semibold text-slate-800">{extractedData.company}</span>
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                        {extractedData.billType}
                      </span>
                    </div>
                  )}
                  
                  {/* Main Amounts */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs">Units Consumed</span>
                      <p className="font-bold text-slate-900 text-lg">{extractedData.units} <span className="text-xs font-normal text-slate-500">kWh</span></p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Payable Amount</span>
                      <p className="font-bold text-primary-600 text-lg">PKR {extractedData.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* All Details */}
                  <div className="border-t border-slate-200 pt-2 space-y-1.5 text-xs">
                    {extractedData.billMonth && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">📅 Bill Month</span>
                        <span className="text-slate-700 font-medium">{extractedData.billMonth}</span>
                      </div>
                    )}
                    {extractedData.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">⏰ Due Date</span>
                        <span className="text-slate-700 font-medium">{extractedData.dueDate}</span>
                      </div>
                    )}
                    {extractedData.referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">🔢 Reference No</span>
                        <span className="text-slate-700 font-mono text-[10px]">{extractedData.referenceNumber}</span>
                      </div>
                    )}
                    {extractedData.meterNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">📟 Meter No</span>
                        <span className="text-slate-700 font-mono text-[10px]">{extractedData.meterNumber}</span>
                      </div>
                    )}
                    {extractedData.consumerName && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">👤 Consumer</span>
                        <span className="text-slate-700 font-medium">{extractedData.consumerName}</span>
                      </div>
                    )}
                    {extractedData.currentBill > 0 && extractedData.currentBill !== extractedData.total && (
                      <div className="flex justify-between text-slate-400">
                        <span>💳 Current Bill</span>
                        <span>PKR {extractedData.currentBill.toLocaleString()}</span>
                      </div>
                    )}
                    {extractedData.arrears > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>⚠️ Arrears</span>
                        <span>PKR {extractedData.arrears.toLocaleString()}</span>
                      </div>
                    )}
                    {extractedData.taxes > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>📋 Taxes</span>
                        <span>PKR {extractedData.taxes.toLocaleString()}</span>
                      </div>
                    )}
                    {extractedData.fuelAdjustment !== 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>⛽ Fuel Adjustment</span>
                        <span>PKR {extractedData.fuelAdjustment.toLocaleString()}</span>
                      </div>
                    )}
                    {extractedData.afterDueDate > 0 && (
                      <div className="flex justify-between text-red-500 font-medium">
                        <span>🚨 After Due Date</span>
                        <span>PKR {extractedData.afterDueDate.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
                    💡 If values are incorrect, click "Cancel" and use manual entry
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={confirmAndNavigate}
                    className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    ✓ Looks Good - Continue
                  </button>
                  <button
                    onClick={resetUpload}
                    className="px-4 bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    ✗ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Upload size={32} className="text-primary-600" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upload Your Bill</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-2">
                ⚡ Electricity & 🔥 Gas bills supported
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <p className="text-sm font-medium">{error}</p>
            {preview && (
              <button 
                onClick={resetUpload}
                className="mt-2 text-xs flex items-center gap-1 text-red-700 hover:text-red-800 font-medium"
              >
                <RefreshCw size={12} />
                Try another file
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400">
          Supported: JPG, PNG, WEBP, PDF (max 10MB)
        </p>
        <p className="text-xs text-slate-400 mt-1">
          🤖 Powered by Gemini AI for accurate data extraction
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
