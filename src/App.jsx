import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Zap, ShoppingCart, Smartphone, X, Loader2,
  History, Activity, Briefcase, CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react';

const MARKET_CATEGORIES = [
  { id: 'accounts', name: 'Premium Accounts', icon: Briefcase, color: 'from-purple-600 to-indigo-500' },
  { id: 'proxy', name: 'Proxies', icon: Globe, color: 'from-blue-600 to-cyan-500' },
];

const MARKET_ITEMS = [
  { id: 'acc1', cat: 'accounts', name: 'Transcription Account', price: 32000, detail: 'High-yield platform access' },
  { id: 'acc2', cat: 'accounts', name: 'Data Annotation', price: 26000, detail: 'AI training & labeling portal' },
  { id: 'acc3', cat: 'accounts', name: 'Handshake Account', price: 24500, detail: 'Premium verified handshake' },
  { id: 'acc4', cat: 'accounts', name: 'Chat Moderation', price: 19400, detail: 'Active moderation dashboard' },
  { id: 'acc5', cat: 'accounts', name: 'Data Entry', price: 15000, detail: 'Standard processing portal' },
  { id: 'p1', cat: 'proxy', name: 'Residential Node (3 months)', price: 1500, detail: 'High anonymity residential IP' },
  { id: 'p2', cat: 'proxy', name: 'Datacenter Proxy Pack', price: 2200, detail: 'High-speed dedicated throughput' }
];

const NavItem = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group ${active ? 'bg-purple-500/10 text-purple-400 font-black' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-full"></div>}
    <Icon size={20} />
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedCat, setSelectedCat] = useState('accounts');
  const [checkout, setCheckout] = useState(null);
  const [proof, setProof] = useState('');
  const [userData, setUserData] = useState({ inventory: [], logs: [], balance: 0 });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  // --- BROWSER HISTORY LOGIC ---
  useEffect(() => {
    if (!session) return;
    window.history.pushState({ tab: activeTab }, "");
    const handlePopState = (event) => {
      if (checkout) { setCheckout(null); } 
      else if (event.state && event.state.tab) { setActiveTab(event.state.tab); } 
      else { setActiveTab('dashboard'); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, checkout, session]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSession(true); setLoading(false); }, 1200);
  };

  const handleVerify = () => {
    const mpesaRegex = /^[S|T|Q|R][A-Z0-9]{9}$/;
    if (!mpesaRegex.test(proof.toUpperCase())) {
      setError('Invalid Transaction Format');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      const newAsset = { ...checkout, uid: Math.random().toString(36).toUpperCase().slice(2,8), datePurchased: new Date().toLocaleDateString() };
      setUserData(prev => ({
        ...prev,
        inventory: [newAsset, ...prev.inventory],
        logs: [{ item: checkout.name, price: checkout.price, tx: proof.toUpperCase(), date: new Date().toLocaleString() }, ...prev.logs]
      }));
      setVerifying(false);
      setCheckout(null);
      setProof('');
      setActiveTab('inventory');
    }, 4000);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="w-full max-w-md bg-[#0f0f0f]/90 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[3rem] text-center shadow-2xl relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(139,92,246,0.3)]"><Shield className="text-white" size={40} /></div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-10">Blue<span className="text-purple-500">Node</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="OPERATOR ID" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none text-sm font-bold" required />
            <input type="password" placeholder="ACCESS KEY" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none text-sm font-bold" required />
            <button className="w-full py-5 bg-white text-black hover:bg-purple-600 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg">{loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Authorize"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-slate-200 flex font-sans overflow-hidden">
      <nav className="hidden md:flex w-72 flex-col border-r border-white/5 bg-[#0a0a0a] p-8">
        <div className="flex items-center gap-3 mb-12"><div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg"><Shield className="text-white" size={22} /></div><span className="text-2xl font-black text-white italic">BlueNode</span></div>
        <div className="flex-1 space-y-2">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={ShoppingCart} label="Marketplace" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Zap} label="Active Nodes" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Audit Logs" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-2xl font-black text-white mb-8 italic uppercase tracking-tight">Marketplace</h1>
              <div className="flex flex-wrap gap-2 mb-10 bg-white/5 p-2 rounded-2xl w-fit border border-white/5">
                {MARKET_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${selectedCat === cat.id ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}><cat.icon size={16} /> {cat.name}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MARKET_ITEMS.filter(item => item.cat === selectedCat).map(item => {
                  const category = MARKET_CATEGORIES.find(c => c.id === item.cat);
                  return (
                    <div key={item.id} className="bg-[#0f0f0f] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-purple-500/30 transition-all group">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-6 shadow-lg`}><category.icon size={18} /></div>
                      <h3 className="text-xl font-black text-white mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-500 mb-8 leading-relaxed font-medium">{item.detail}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-lg font-black text-white font-mono uppercase">KES {item.price.toLocaleString()}</span>
                        <button onClick={() => setCheckout(item)} className="bg-white text-black font-black px-4 py-2.5 rounded-xl hover:bg-purple-600 hover:text-white transition-all text-[10px] uppercase tracking-widest">Select</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(activeTab === 'inventory' || activeTab === 'history') && (
            <div className="animate-in fade-in duration-500">
               <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveTab('dashboard')} className="md:hidden p-2 bg-white/5 rounded-xl text-slate-400"><ArrowLeft size={20}/></button>
                <h1 className="text-2xl font-black text-white italic uppercase">{activeTab === 'inventory' ? 'Active Nodes' : 'Audit Logs'}</h1>
              </div>
              {activeTab === 'inventory' ? (
                <div className="space-y-4">
                  {userData.inventory.length > 0 ? userData.inventory.map((item, idx) => (
                    <div key={idx} className="bg-[#0f0f0f] border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-purple-500 border border-white/10"><Activity size={18} /></div>
                        <div><p className="font-black text-white">{item.name}</p><p className="text-[9px] text-slate-500 uppercase font-mono">ID: {item.uid}</p></div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase">Active</span>
                    </div>
                  )) : <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-slate-500 font-black uppercase text-xs tracking-widest">No Nodes Found</div>}
                </div>
              ) : (
                <div className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                      <tr className="border-b border-white/5"><th className="p-6">Asset</th><th className="p-6">Trace ID</th><th className="p-6 text-right">Debit</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userData.logs.map((log, i) => (
                        <tr key={i} className="text-xs font-medium"><td className="p-6 text-white">{log.item}</td><td className="p-6 text-purple-400 font-mono text-[10px] uppercase tracking-widest">{log.tx}</td><td className="p-6 text-right font-black">KES {log.price.toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {checkout && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            {!verifying ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <button onClick={() => setCheckout(null)} className="absolute top-0 right-0 p-8 text-slate-500 hover:text-white"><X size={20}/></button>
                <div className="text-center">
                  <Smartphone size={32} className="text-green-500 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">M-Pesa Verification</p>
                  <p className="text-3xl font-black text-white mb-4 italic tracking-tight">0781032460</p>
                  <div className="bg-purple-500/10 py-3 rounded-2xl border border-purple-500/20 mb-6"><p className="text-purple-400 font-black text-2xl font-mono uppercase">KES {checkout.price.toLocaleString()}</p></div>
                  <div className="space-y-3">
                    <input type="text" placeholder="ENTER TRANSACTION CODE" className={`w-full bg-black border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-5 text-white text-center font-mono tracking-[0.3em] outline-none uppercase`} value={proof} onChange={(e) => setProof(e.target.value)} />
                    {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
                    <button onClick={handleVerify} disabled={!proof} className="w-full py-5 bg-white text-black hover:bg-purple-600 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Process Transaction</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center"><Shield className="text-purple-500 animate-pulse" size={32} /></div>
                </div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Verifying Node</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Wait for ledger confirmation...</p>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 inline-flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                  <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">Signal: {proof.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}