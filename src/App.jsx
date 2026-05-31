import React, { useState, useEffect } from 'react';
import {
  Shield, Globe, Zap, ShoppingCart, X,
  Briefcase, Loader2, AlertCircle, Lock, UserPlus
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIG ---
const supabase = createClient(
  'https://nkfjedmowntrngqkgpqs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZmplZG1vd250cm5ncWtncHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTE1MTksImV4cCI6MjA5MTQyNzUxOX0.CzEA-J_2wBo2FSRXxxs7MSZs9VCra46IYgqKcTIO_p8'
);

const MARKET_ITEMS = [
  { id: 'acc1', name: 'Transcription Account', price: 72000, detail: 'High-yield platform access' },
  { id: 'acc2', name: 'Data Annotation', price: 46000, detail: 'AI training & labeling portal' },
  { id: 'acc3', name: 'Handshake Account', price: 34500, detail: 'Premium verified handshake' },
  { id: 'acc4', name: 'Chat Moderation', price: 21400, detail: 'Active moderation dashboard' },
  { id: 'acc5', name: 'Data Entry', price: 12500, detail: 'Standard processing portal' },
  { id: 'acc6', name: 'Map reviews', price: 4500, detail: 'Google map review tasks' },
];

const PROXY_ITEMS = [
  { id: 'p1', name: 'Residential Node', price: 1700, detail: 'High anonymity residential IP' },
  { id: 'p2', name: 'Datacenter Proxy', price: 2200, detail: 'High-speed dedicated throughput' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('login'); // Starts at Gateway door
  const [isAuthMode, setIsAuthMode] = useState('login'); // 'login' or 'register'
  const [authPassword, setAuthPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [checkout, setCheckout] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('254');
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState('');
  const [purchasedAccount, setPurchasedAccount] = useState(null);
  const [purchasedProxy, setPurchasedProxy] = useState(null);

  // 📝 BACKUP RECOVERY STATES
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // ✅ Interval state management
  const [intervalId, setIntervalId] = useState(null);

  // Auto session restore if credentials exist locally
  useEffect(() => {
    const savedPhone = localStorage.getItem('bn_auth_phone');
    if (savedPhone) {
      setPhoneNumber(savedPhone);
      routeUserByPaymentHistory(savedPhone);
    }
  }, []);

  // ✅ Auto reset when window checkout closes or switches
  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (!checkout) {
      setVerifying(false);
      setPaymentStatus(null);
      setShowRecovery(false);
      setRecoveryInput('');
      setRecoveryError('');
      setIsVerifying(false);
    }
  }, [checkout]);

  // ✅ Unmount cleanup safety hook
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // 🔄 CORE ROUTING ENGINE BASED ON PAYMENT STATUS
  const routeUserByPaymentHistory = async (targetPhone) => {
    try {
      const { data: payments, error: dbError } = await supabase
        .from('mpesa_payments')
        .select('*')
        .eq('status', 'success')
        .eq('claimed_by_user', targetPhone);

      if (dbError) throw dbError;

      if (payments && payments.length > 0) {
        const accountPayment = payments.find(p => 
          MARKET_ITEMS.some(item => item.price === parseFloat(p.amount_paid))
        );
        const proxyPayment = payments.find(p => 
          PROXY_ITEMS.some(proxy => proxy.price === parseFloat(p.amount_paid))
        );

        if (accountPayment) {
          const matchedAccount = MARKET_ITEMS.find(item => item.price === parseFloat(accountPayment.amount_paid));
          setPurchasedAccount(matchedAccount);
          localStorage.setItem('bn_purchasedAccount', JSON.stringify(matchedAccount));
        }

        if (proxyPayment) {
          const matchedProxy = PROXY_ITEMS.find(proxy => proxy.price === parseFloat(proxyPayment.amount_paid));
          setPurchasedProxy(matchedProxy);
          localStorage.setItem('bn_purchasedProxy', JSON.stringify(matchedProxy));
        }

        // Smart directing logic based on their specific transaction coverage
        if (accountPayment && proxyPayment) {
          setActiveTab('provisioning');
        } else if (accountPayment) {
          setActiveTab('proxy_selection');
        } else {
          setActiveTab('dashboard');
        }
      } else {
        setPurchasedAccount(null);
        setPurchasedProxy(null);
        setActiveTab('dashboard');
      }
    } catch (err) {
      setError('ROUTING SUBSYSTEM FAILURE.');
    }
  };

  // 🔐 UNIFIED SECURE TERMINAL AUTHENTICATION GATEWAY
  const handleAuthAction = async () => {
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.slice(1);
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) cleaned = '254' + cleaned;
    
    if (cleaned.length < 12 || !cleaned.startsWith('254')) {
      setError('VALID FORMAT REQUIRED (E.G. 2547...)');
      return;
    }

    if (!authPassword || authPassword.length < 4) {
      setError('PASSWORD MUST BE AT LEAST 4 CHARACTERS.');
      return;
    }

    setError('');
    setIsLoggingIn(true);

    try {
      if (isAuthMode === 'register') {
        // Run database insert for registration
        const { error: regError } = await supabase
          .from('bn_users')
          .insert([{ phone: cleaned, password: authPassword }]);

        if (regError) {
          if (regError.code === '23505') { // Postgres code for unique violation
            throw new Error('PHONE NUMBER ALREADY REGISTERED. SWITCH TO LOGIN.');
          }
          throw regError;
        }

        localStorage.setItem('bn_auth_phone', cleaned);
        setPhoneNumber(cleaned);
        setActiveTab('dashboard'); // Fresh accounts start directly on Marketplace dashboard
      } else {
        // Run verification check for login
        const { data: userData, error: loginError } = await supabase
          .from('bn_users')
          .select('*')
          .eq('phone', cleaned)
          .maybeSingle();

        if (loginError) throw loginError;
        if (!userData || userData.password !== authPassword) {
          throw new Error('AUTHENTICATION FAILED: INVALID CREDENTIALS.');
        }

        localStorage.setItem('bn_auth_phone', cleaned);
        setPhoneNumber(cleaned);
        await routeUserByPaymentHistory(cleaned); // Fetch history and send them to their exact step
      }
    } catch (err) {
      setError(err.message.toUpperCase());
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMpesaPayment = async () => {
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
            setIntervalId(null);

            // Firmly link this transaction row to the logged-in user profile
            await supabase
              .from('mpesa_payments')
              .update({ claimed_by_user: phoneNumber })
              .eq('checkout_request_id', checkoutID);

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
              setCheckout(null);
              setVerifying(false);
              setPaymentStatus(null);
            }, 1000);

          } else if (payment?.status === 'failed' || payment?.status === 'cancelled') {
            clearInterval(checkStatus);
            setIntervalId(null);

            setPaymentStatus('FAILED');
            setTimeout(() => {
              setVerifying(false);
              setPaymentStatus(null);
              setCheckout(null);
            }, 1500);
          }
        }, 2000);

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

  const handleRecoveryVerify = async () => {
    if (!recoveryInput.trim()) return;

    setRecoveryError('');
    setIsVerifying(true);

    try {
      let searchPhone = null;
      let searchReceipt = null;
      const expectedAmount = checkout.price; 

      const extractedReceipt = recoveryInput.match(/([A-Z0-9]{10})/i);

      if (recoveryInput.toUpperCase().includes('CONFIRMED') && extractedReceipt) {
        searchReceipt = extractedReceipt[1].toUpperCase();
      } else {
        let cleaned = recoveryInput.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = '254' + cleaned.slice(1);
        if (cleaned.startsWith('7') || cleaned.startsWith('1')) cleaned = '254' + cleaned;
        
        if (cleaned.length === 12 && cleaned.startsWith('254')) {
          searchPhone = cleaned;
        } else {
          throw new Error("INVALID FORMAT. ENTER PHONE NUMBER OR PASTE FULL M-PESA SMS.");
        }
      }

      let query = supabase
        .from('mpesa_payments')
        .select('*')
        .eq('status', 'success');

      if (searchReceipt) {
        query = query.eq('mpesa_receipt', searchReceipt);
      } else {
        query = query.eq('phone', searchPhone);
      }

      const { data: payments, error: dbError } = await query;

      if (dbError) throw dbError;
      if (!payments || payments.length === 0) {
        throw new Error("NO MATCHING SUCCESSFUL TRANSACTION RECORD IN DATABASE.");
      }

      const latestPayment = payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      if (parseFloat(latestPayment.amount_paid) !== expectedAmount) {
        throw new Error(`PRICE MISMATCH. PAID KES ${latestPayment.amount_paid} FOR A KES ${expectedAmount} ITEM.`);
      }

      if (latestPayment.claimed_by_user && latestPayment.claimed_by_user !== phoneNumber) {
        throw new Error("SECURITY BLOCK: THIS PAYMENT TRANSACTION WAS ALREADY CLAIMED.");
      }

      if (!latestPayment.claimed_by_user) {
        const { error: updateError } = await supabase
          .from('mpesa_payments')
          .update({ claimed_by_user: phoneNumber })
          .eq('id', latestPayment.id);

        if (updateError) throw updateError;
      }

      if (intervalId) clearInterval(intervalId);
      setVerifying(true);
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
        setCheckout(null);
        setVerifying(false);
        setPaymentStatus(null);
        setShowRecovery(false);
        setRecoveryInput('');
      }, 1000);

    } catch (err) {
      setRecoveryError(err.message.toUpperCase());
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setPhoneNumber('254');
    setAuthPassword('');
    setPurchasedAccount(null);
    setPurchasedProxy(null);
    setIsAuthMode('login');
    setActiveTab('login');
  };

  // --- COMPACT USER GATEWAY FORM ---
  if (activeTab === 'login') {
    return (
      <div className="min-h-screen bg-[#060606] text-slate-200 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-[0_0_60px_rgba(147,51,234,0.08)] relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full"></div>
          
          <div className="text-center mb-6 relative z-10">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {isAuthMode === 'login' ? <Lock size={20} /> : <UserPlus size={20} />}
            </div>
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">
              {isAuthMode === 'login' ? 'Terminal Login' : 'Register Terminal'}
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
              {isAuthMode === 'login' ? 'Access Infrastructure Profile' : 'Initialize New Identity Link'}
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">M-Pesa Number:</label>
              <input
                type="text"
                disabled={isLoggingIn}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-white font-mono outline-none text-base text-center focus:border-purple-500/40 transition-all"
                placeholder="2547XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Session Password:</label>
              <input
                type="password"
                disabled={isLoggingIn}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-white font-mono outline-none text-base text-center focus:border-purple-500/40 transition-all tracking-widest"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[9px] text-center font-black text-red-500 uppercase tracking-wider bg-red-500/5 border border-red-500/10 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              onClick={handleAuthAction}
              disabled={isLoggingIn}
              className="w-full py-4 bg-white text-black hover:bg-purple-600 hover:text-white disabled:bg-white/5 disabled:text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                isAuthMode === 'login' ? 'Authenticate' : 'Establish Link'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsAuthMode(isAuthMode === 'login' ? 'register' : 'login');
                }}
                className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-purple-400 transition-colors underline"
              >
                {isAuthMode === 'login' ? "Need a new account? Register" : "Already registered? Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-slate-200 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar */}
      <nav className="hidden md:flex w-72 flex-col border-r border-white/5 bg-[#0a0a0a] p-8">
        <div className="flex items-center gap-3 mb-12">
          <Shield className="text-purple-500" size={24} />
          <span className="text-xl font-black text-white italic uppercase tracking-tighter">BlueNode</span>
        </div>
        <div className="flex-1 space-y-2 text-[11px] font-black uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-500'}`}
          >
            <ShoppingCart size={18}/> Marketplace
          </button>
          <button
            onClick={() => setActiveTab(purchasedProxy ? 'provisioning' : (purchasedAccount ? 'proxy_selection' : 'dashboard'))}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${activeTab !== 'dashboard' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-500'}`}
          >
            <Zap size={18}/> Node Manager
          </button>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 text-center">
          <p className="text-[9px] font-mono text-slate-500 truncate mb-2">{phoneNumber}</p>
          <button 
            onClick={handleLogout}
            className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
          >
            Disconnect Terminal
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {MARKET_ITEMS.map(item => (
              <div key={item.id} className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[2rem] flex flex-col hover:border-purple-500/20 transition-all">
                <Briefcase className="text-purple-500 mb-4" size={20} />
                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">{item.name}</h3>
                <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest">{item.detail}</p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="font-mono font-black text-white text-sm">KES {item.price.toLocaleString()}</span>
                  <button onClick={() => setCheckout(item)} className="bg-white text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase hover:bg-purple-600 hover:text-white transition-all">Select</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'proxy_selection' && (
          <div className="max-w-3xl mx-auto text-center py-10 animate-in zoom-in-95 duration-500">
            <h1 className="text-3xl font-black text-white italic uppercase mb-8 tracking-tighter">Select Proxy Node</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROXY_ITEMS.map(proxy => (
                <div key={proxy.id} className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[2rem] text-left hover:border-purple-500/30 transition-all">
                  <Globe className="text-purple-500 mb-4" size={24} />
                  <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter">{proxy.name}</h3>
                  <button onClick={() => setCheckout(proxy)} className="w-full mt-6 py-4 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Link Node (KES {proxy.price})</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'provisioning' && (
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-10 max-w-2xl mx-auto text-center animate-in slide-in-from-bottom-8 duration-500">
            <Zap className="text-purple-500 mx-auto mb-6" size={48}/>
            <h2 className="text-2xl font-black text-white uppercase italic mb-4">{purchasedAccount?.name}</h2>
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 font-mono text-[11px] text-left space-y-2">
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 uppercase">Status</span><span className="text-green-500">ACTIVE</span></div>
              <div className="flex justify-between"><span className="text-slate-500 uppercase">Route</span><span className="text-purple-400">{purchasedProxy?.name}</span></div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-8 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-red-500"
            >
              Reset All Nodes
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      {checkout && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-[0_0_50px_rgba(147,51,234,0.15)] my-auto">
            <button onClick={() => setCheckout(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20}/></button>
            
            {!verifying ? (
              <div className="text-center">
                <p className="text-white font-black text-4xl font-mono tracking-tighter mb-8 uppercase">KES {checkout.price.toLocaleString()}</p>

                <div className="relative mb-6 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  Payment for: <strong className="text-white block mt-1">{checkout.name}</strong>
                </div>

                <button onClick={handleMpesaPayment} className="w-full py-5 bg-white text-black hover:bg-purple-600 hover:text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-colors">
                  Authorize Payment
                </button>
              </div>
            ) : (
              <div className="py-6 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <h3 className="text-sm font-black uppercase italic tracking-widest text-white mb-4">
                  {paymentStatus}
                </h3>
              </div>
            )}

            {/* --- ALREADY PAID RECOVERY LAYER --- */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <button 
                type="button"
                onClick={() => setShowRecovery(!showRecovery)}
                className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-purple-400 transition-colors underline"
              >
                {showRecovery ? "Hide Recovery Options" : "Already paid but stuck?"}
              </button>

              {showRecovery && (
                <div className="mt-4 text-left p-4 bg-black/40 border border-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Paste M-Pesa Message OR Input Number:
                  </label>
                  
                  <textarea
                    rows={3}
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="e.g., QEJ48DKS93 Confirmed... OR 2547XXXXXXXX"
                    className="w-full p-3 bg-black/60 border border-white/5 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500/50 resize-none transition-all"
                  />

                  {recoveryError && (
                    <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-red-500">{recoveryError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleRecoveryVerify}
                    disabled={isVerifying || !recoveryInput.trim()}
                    className="mt-3 w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-slate-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                  >
                    {isVerifying ? "Verifying..." : "Verify & Unlock"}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}