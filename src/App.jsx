import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Zap, ShoppingCart, Smartphone, X, Loader2,
  History, Activity, Briefcase, CheckCircle2, AlertCircle, ArrowLeft,
  ChevronRight, Lock, Server, Terminal, Radio, Copy, Menu
} from 'lucide-react';

const MARKET_ITEMS = [
  { id: 'acc1', cat: 'accounts', name: 'Transcription Account', price: 32000, detail: 'High-yield platform access' },
  { id: 'acc2', cat: 'accounts', name: 'Data Annotation', price: 26000, detail: 'AI training & labeling portal' },
  { id: 'acc3', cat: 'accounts', name: 'Handshake Account', price: 24500, detail: 'Premium verified handshake' },
  { id: 'acc4', cat: 'accounts', name: 'Chat Moderation', price: 19400, detail: 'Active moderation dashboard' },
  { id: 'acc5', cat: 'accounts', name: 'Data Entry', price: 15000, detail: 'Standard processing portal' },
];

const PROXY_ITEMS = [
  { id: 'p1', name: 'Residential Node', price: 1500, detail: 'High anonymity residential IP' },
  { id: 'p2', name: 'Datacenter Proxy', price: 2200, detail: 'High-speed dedicated throughput' }
];

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [checkout, setCheckout] = useState(null);
  const [proof, setProof] = useState('');
  const [userData, setUserData] = useState({ inventory: [], logs: [] });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [purchasedAccount, setPurchasedAccount] = useState(null);
  const [purchasedProxy, setPurchasedProxy] = useState(null);

  // PERSISTENCE
  useEffect(() => {
    const savedAccount = localStorage.getItem('bn_purchasedAccount');
    const savedProxy = localStorage.getItem('bn_purchasedProxy');
    const savedTab = localStorage.getItem('bn_activeTab');
    if (savedAccount) setPurchasedAccount(JSON.parse(savedAccount));
    if (savedProxy) setPurchasedProxy(JSON.parse(savedProxy));
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem('bn_activeTab', activeTab);
      if (purchasedAccount) localStorage.setItem('bn_purchasedAccount', JSON.stringify(purchasedAccount));
      if (purchasedProxy) localStorage.setItem('bn_purchasedProxy', JSON.stringify(purchasedProxy));
    }
  }, [activeTab, purchasedAccount, purchasedProxy, session]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { 
      setSession(true); setLoading(false);
      if (purchasedProxy) setActiveTab('provisioning');
      else if (purchasedAccount) setActiveTab('proxy_selection');
    }, 1200);
  };

  const handleVerify = () => {
    if (!proof) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      if (activeTab === 'proxy_selection') {
        setPurchasedProxy(checkout);
        setActiveTab('provisioning');
      } else {
        setPurchasedAccount(checkout);
        setActiveTab('proxy_selection');
      }
      setUserData(prev => ({
        ...prev,
        logs: [{ item: checkout.name, price: checkout.price, tx: proof.toUpperCase(), date: new Date().toLocaleString() }, ...prev.logs]
      }));
      setCheckout(null); setProof('');
    }, 4000);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f0f0f] border border-white/5 p-8 md:p-12 rounded-[2.5rem] text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-6"><Shield className="text-white" size={32} /></div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">Blue<span className="text-purple-500">Node</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="OPERATOR ID" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none font-bold text-xs tracking-widest uppercase" required />
            <input type="password" placeholder="ACCESS KEY" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none font-bold text-xs tracking-widest uppercase" required />
            <button className="w-full py-4 bg-white text-black hover:bg-purple-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all mt-2">{loading ? <Loader2 className="animate-spin mx-auto" /> : "Authorize"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-slate-200 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* SIDEBAR (Desktop Only) */}
      <nav className="hidden md:flex w-72 flex-col border-r border-white/5 bg-[#0a0a0a] p-8">
        <div className="flex items-center gap-3 mb-12"><Shield className="text-purple-500" size={24} /><span className="text-xl font-black text-white italic">BlueNode</span></div>
        <div className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-500'}`}><ShoppingCart size={18}/> Marketplace</button>
          <button onClick={() => setActiveTab(purchasedProxy ? 'provisioning' : (purchasedAccount ? 'proxy_selection' : 'dashboard'))} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${activeTab !== 'dashboard' && activeTab !== 'history' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-500'}`}><Zap size={18}/> Node Manager</button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${activeTab === 'history' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-500'}`}><History size={18}/> Audit Logs</button>
        </div>
      </nav>

      {/* MOBILE TOP NAV */}
      <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-2"><Shield className="text-purple-500" size={20} /><span className="text-lg font-black text-white italic">BlueNode</span></div>
        <Activity className="text-purple-500" size={18} />
      </div>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          
          {/* MARKETPLACE */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-700">
              <h1 className="text-xl font-black text-white mb-6 italic uppercase tracking-tight">Marketplace</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {MARKET_ITEMS.map(item => (
                  <div key={item.id} className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[2rem] flex flex-col group">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-500 flex items-center justify-center mb-4"><Briefcase size={20} /></div>
                    <h3 className="text-lg font-black text-white mb-1">{item.name}</h3>
                    <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-wider">{item.detail}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="font-mono font-black text-white">KES {item.price.toLocaleString()}</span>
                      <button onClick={() => setCheckout(item)} className="bg-white text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter">Select</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROXY SELECTION */}
          {activeTab === 'proxy_selection' && (
            <div className="animate-in zoom-in-95 duration-700 max-w-3xl mx-auto text-center py-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase mb-4"><CheckCircle2 size={12}/> Account Locked</div>
              <h1 className="text-3xl font-black text-white italic uppercase mb-2">Proxy Node</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-8">Link infrastructure to {purchasedAccount?.name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROXY_ITEMS.map(proxy => (
                  <div key={proxy.id} className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[2rem] text-left relative overflow-hidden">
                    <Globe className="text-purple-500 mb-4" size={24} />
                    <h3 className="text-xl font-black text-white mb-1">{proxy.name}</h3>
                    <p className="text-[9px] text-slate-500 uppercase mb-8">{proxy.detail}</p>
                    <button onClick={() => setCheckout(proxy)} className="w-full py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase">Link Node</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROVISIONING DASHBOARD */}
          {activeTab === 'provisioning' && (
            <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-4">
              <h1 className="text-xl font-black text-white italic uppercase mb-6 tracking-widest">Operator Uplink</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-6">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Briefcase size={20}/></div>
                        <div><h2 className="text-sm font-black text-white uppercase">{purchasedAccount?.name}</h2><p className="text-[9px] text-slate-500 font-mono">ID: BN-ACC-LIV</p></div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-[8px] font-black uppercase">Bought</span>
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-md text-[8px] font-black uppercase animate-pulse">Pending</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">State</p>
                        <p className="text-red-500 text-[10px] font-black uppercase">Inactive</p>
                      </div>
                      <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Tunnel</p>
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">RSA</p>
                      </div>
                   </div>
                </div>
                <div className="bg-purple-600 rounded-[2rem] p-6 text-white flex flex-col justify-between min-h-[160px]">
                   <div className="flex items-center justify-between"><Globe size={24} /><span className="text-[8px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">Active</span></div>
                   <div>
                     <h2 className="text-lg font-black uppercase italic leading-tight">{purchasedProxy?.name}</h2>
                     <div className="mt-3 bg-black/20 rounded-lg p-3 font-mono text-[9px] flex items-center justify-between">
                       <span>185.245.18.22:8080</span><Copy size={12} className="opacity-50" />
                     </div>
                   </div>
                </div>
              </div>
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <Terminal size={14} className="text-slate-500" />
                <p className="text-[9px] text-slate-500 font-mono uppercase truncate">Syncing handshake with {purchasedAccount?.name}...</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-purple-500' : 'text-slate-500'}`}><ShoppingCart size={20}/><span className="text-[8px] font-black uppercase">Market</span></button>
        <button onClick={() => {if (purchasedProxy) setActiveTab('provisioning'); else if (purchasedAccount) setActiveTab('proxy_selection'); else setActiveTab('dashboard');}} className={`flex flex-col items-center gap-1 ${activeTab !== 'dashboard' && activeTab !== 'history' ? 'text-purple-500' : 'text-slate-500'}`}><Zap size={20}/><span className="text-[8px] font-black uppercase">Node</span></button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-purple-500' : 'text-slate-500'}`}><History size={20}/><span className="text-[8px] font-black uppercase">Logs</span></button>
      </div>

      {/* MODAL (Responsive) */}
      {checkout && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 relative">
            {!verifying ? (
              <div className="text-center animate-in zoom-in-95">
                <button onClick={() => setCheckout(null)} className="absolute top-4 right-4 text-slate-500"><X size={20}/></button>
                <Smartphone size={28} className="text-green-500 mx-auto mb-4" />
                <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Confirm Payment</p>
                <div className="bg-purple-500/10 py-3 rounded-xl mb-6 border border-purple-500/20"><p className="text-purple-400 font-black text-xl font-mono">KES {checkout.price.toLocaleString()}</p></div>
                <input type="text" placeholder="MPESA CODE" className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white text-center font-mono tracking-widest outline-none mb-4 uppercase text-sm" value={proof} onChange={(e) => setProof(e.target.value)} />
                <button onClick={handleVerify} className="w-full py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest">Process</button>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={32} />
                <p className="text-white text-xs font-black uppercase italic">Verifying Node...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}