import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Zap, ShoppingCart, X, 
  Briefcase, Loader2, AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIG ---
const supabase = createClient(
  'https://nkfjedmowntrngqkgpqs.supabase.co', 
  'YOUR_KEY'
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [checkout, setCheckout] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('254'); 
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState('');
  const [purchasedAccount, setPurchasedAccount] = useState(null);
  const [purchasedProxy, setPurchasedProxy] = useState(null);

  // ✅ NEW: track interval globally
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const savedAccount = localStorage.getItem('bn_purchasedAccount');
    const savedProxy = localStorage.getItem('bn_purchasedProxy');
    if (savedAccount) setPurchasedAccount(JSON.parse(savedAccount));
    if (savedProxy) setPurchasedProxy(JSON.parse(savedProxy));
  }, []);

  // ✅ NEW: clear interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // ✅ NEW: reset when checkout changes (THIS FIXES YOUR ISSUE)
  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setVerifying(false);
    setPaymentStatus(null);
  }, [checkout]);

  const handleMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('VALID PHONE REQUIRED');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    setVerifying(true);
    setPaymentStatus('SENDING STK...');

    try {
      const response = await fetch('https://nkfjedmowntrngqkgpqs.supabase.co/functions/v1/mpesa-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, amount: checkout.price.toString() })
      });
      
      const data = await response.json();

      if (data.CheckoutRequestID || data.ResponseCode === "0") {
        setPaymentStatus('WAITING FOR PIN...');
        const checkoutID = data.CheckoutRequestID;

        const checkStatus = setInterval(async () => {
          const { data: payment } = await supabase
            .from('mpesa_payments')
            .select('status')
            .eq('checkout_request_id', checkoutID)
            .maybeSingle();

          if (payment?.status === 'success') {
            clearInterval(checkStatus);
            setIntervalId(null); // ✅ added

            setPaymentStatus('SUCCESS!');
            setTimeout(() => {
              if (activeTab === 'proxy_selection') { 
                setPurchasedProxy(checkout); 
                localStorage.setItem('bn_purchasedProxy', JSON.stringify(checkout));
                setActiveTab('provisioning'); 
              } else { 
                setPurchasedAccount(checkout); 
                localStorage.setItem('bn_purchasedAccount', JSON.stringify(checkout));
                setActiveTab('proxy_selection'); 
              }
              setVerifying(false); 
              setCheckout(null);
              setPaymentStatus(null);
            }, 800);

          } else if (payment?.status === 'failed' || payment?.status === 'cancelled') {
            clearInterval(checkStatus);
            setIntervalId(null); // ✅ added

            setPaymentStatus('FAILED');
            setTimeout(() => {
              setVerifying(false);
              setPaymentStatus(null);
            }, 1500);
          }
        }, 600);

        // ✅ STORE interval
        setIntervalId(checkStatus);

      } else {
        throw new Error(data.errorMessage || 'PUSH FAILED');
      }
    } catch (err) { 
      setError(err.message.toUpperCase());
      setTimeout(() => {
        setVerifying(false);
        setError('');
      }, 3000);
    }
  };

  return (
    // ❌ UI unchanged (I DID NOT TOUCH YOUR UI)
    <div>YOUR UI SAME AS BEFORE</div>
  );
}