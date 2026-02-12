import { createContext, useContext, useState } from 'react';

const BillContext = createContext();

export const BillProvider = ({ children }) => {
  const [billData, setBillData] = useState({
    units: 0,
    rate: 10, // Default base rate as per brief
    extraCharges: 0,
    taxRate: 0.05, // 5% default
    total: 0,
    breakdown: {
      base: 0,
      tax: 0,
      extras: 0
    },
    rawText: '', // For OCR text
    isAnalyzed: false,
    // Additional bill details
    dueDate: '',
    referenceNumber: '',
    billMonth: '',
    currentBill: 0,
    afterDueDate: 0,
  });

  const updateBillData = (data) => {
    // Calculate totals automatically if not provided
    const units = Number(data.units) || billData.units;
    const rate = Number(data.rate) || billData.rate;
    const extraCharges = Number(data.extraCharges) || 0;
    const taxRate = Number(data.taxRate) || billData.taxRate;

    const base = units * rate;
    const tax = base * taxRate;
    const total = base + tax + extraCharges;

    setBillData({
      ...billData,
      ...data,
      units,
      rate,
      extraCharges,
      taxRate,
      total: parseFloat(total.toFixed(2)),
      breakdown: {
        base: parseFloat(base.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        extras: parseFloat(extraCharges.toFixed(2))
      },
      isAnalyzed: true
    });
  };

  const resetBillData = () => {
    setBillData({
      units: 0,
      rate: 10,
      extraCharges: 0,
      taxRate: 0.05,
      total: 0,
      breakdown: { base: 0, tax: 0, extras: 0 },
      rawText: '',
      isAnalyzed: false,
      dueDate: '',
      referenceNumber: '',
      billMonth: '',
      currentBill: 0,
      afterDueDate: 0,
    });
  };

  return (
    <BillContext.Provider value={{ billData, updateBillData, resetBillData }}>
      {children}
    </BillContext.Provider>
  );
};

export const useBill = () => useContext(BillContext);
