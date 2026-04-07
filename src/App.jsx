import React, { useState } from 'react';
import { 
  Shield, Globe, Phone, Zap, LayoutDashboard, 
  ShoppingCart, Smartphone, X, Loader2,
  CheckCircle, ArrowRight, FileText, Code, Mail,
  Search, User, ChevronRight, History,
  Lock, Activity, Briefcase, ShoppingBag
} from 'lucide-react';

// --- DATA ---
const MARKET_CATEGORIES = [
  { id: 'accounts', name: 'Premium Accounts', icon: Briefcase, color: 'from-orange-600 to-yellow-500' },
  { id: 'proxy', name: 'Proxies', icon: Globe, color: 'from-blue-500 to-cyan-400' },
  { id: 'numbers', name: 'Virtual Numbers', icon: Phone, color: 'from-purple-500 to-pink-400' },
  { id: 'certs', name: 'DLCC', icon: FileText, color: 'from-orange-500 to-yellow-400' }, // Updated to DLCC
  { id: 'scripts', name: 'IDC', icon: Code, color: 'from-green-500 to-emerald-400' }, // Updated to IDC
  { id: 'mail', name: 'Edu Mails', icon: Mail, color: 'from-red-500 to-rose-400' },
];

const MARKET_ITEMS = [
  // PREMIUM ACCOUNTS
  { id: 'acc1', cat: 'accounts', name: 'Transcription Account', price: 32000, detail: 'High-yield platform access' },
  { id: 'acc2', cat: 'accounts', name: 'Data Annotation', price: 26000, detail: 'AI training & labeling portal' },
  { id: 'acc3', cat: 'accounts', name: 'Handshake Account', price: 24500, detail: 'Premium verified handshake' },
  { id: 'acc4', cat: 'accounts', name: 'Chat Moderation', price: 19400, detail: 'Active moderation dashboard' },
  { id: 'acc5', cat: 'accounts', name: 'Data Entry', price: 15000, detail: 'Standard processing portal' },
  // INFRASTRUCTURE
  { id: 'p1', cat: 'proxy', name: 'Residential Node (3 months)', price: 1500, detail: 'High anonymity residential IP' },
  { id: 'n1', cat: 'numbers', name: 'USA Virtual Line', price: 900, detail: 'SMS & Voice enabled (+1)' },
  { id: 'c1', cat: 'certs', name: 'Class C CDL', price: 1200, detail: 'High-res verifiable design' },
  { id: 's1', cat: 'scripts', name: 'National ID card A', price: 1500, detail: 'Security engagement script' },
  { id: 'm1', cat: 'mail', name: 'Edu Mail CA', price: 800, detail: 'University hosted mailbox' }
];

const NavItem = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group ${active ? 'bg-orange-500/10 text-orange-500 font-black' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-full"></div>}
    <Icon size={20} />
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('selection'); 
  const [selectedCat, setSelectedCat] = useState('accounts');
  const [checkout, setCheckout] = useState(null);
  const [proof, setProof] = useState('');
  const [userData, setUserData] = useState({ inventory: [], logs: [], balance: 0 });
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSession(true); setLoading(false); }, 1000);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      const newAsset = { ...checkout, uid: Math.random().toString(36).toUpperCase().slice(2,8), datePurchased: new Date().toLocaleDateString() };
      setUserData(prev => ({
        ...prev,
        inventory: [newAsset, ...prev.inventory],
        logs: [{ item: checkout.name, price: checkout.price, tx: proof, date: new Date().toLocaleString() }, ...prev.logs]
      }));
      setLoading(false);
      setCheckout(null);
      setProof('');
      setActiveTab('inventory');
    }, 1500);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#141414] border border-white/5 p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-600"></div>
          <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto mb-6"><Shield className="text-white" size={32} /></div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">BlueNode</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Operator Email" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-orange-500 outline-none" required />
            <input type="password" placeholder="Access Key" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-orange-500 outline-none" required />
            <button className="w-full py-5 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Authorize</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-slate-200 flex font-sans">
      {/* SIDEBAR */}
      <nav className="hidden md:flex w-72 flex-col border-r border-white/5 bg-[#1a1a1a] p-8">
        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => setActiveTab('selection')}>
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg"><Shield className="text-white" size={22} /></div>
          <span className="text-2xl font-black text-white italic">BlueNode</span>
        </div>
        <div className="flex-1 space-y-2">
          <NavItem active={activeTab === 'selection'} onClick={() => setActiveTab('selection')} icon={LayoutDashboard} label="Mainframe" />
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={ShoppingCart} label="Marketplace" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Zap} label="Active Nodes" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Audit Logs" />
        </div>
        <button onClick={() => setSession(null)} className="mt-auto text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-red-500">Terminate Session</button>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-10">
          
          {/* SELECTION HUB */}
          {activeTab === 'selection' && (
            <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl font-black text-white mb-10 italic">Initialize Session</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => { setActiveTab('dashboard'); setSelectedCat('accounts'); }} className="bg-[#141414] border border-white/5 p-10 rounded-[2.5rem] hover:border-orange-500/50 transition-all text-left">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 border border-orange-500/20"><ShoppingBag size={28} /></div>
                  <h3 className="text-2xl font-black text-white mb-2">Buy an Account</h3>
                  <p className="text-slate-500 text-sm">Purchase high-yield verified accounts.</p>
                </button>
                <button onClick={() => { setActiveTab('dashboard'); setSelectedCat('proxy'); }} className="bg-[#141414] border border-white/5 p-10 rounded-[2.5rem] hover:border-blue-500/50 transition-all text-left">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20"><Zap size={28} /></div>
                  <h3 className="text-2xl font-black text-white mb-2">Create an Account</h3>
                  <p className="text-slate-500 text-sm">Deploy manual infrastructure modules.</p>
                </button>
              </div>
            </div>
          )}

          {/* MARKETPLACE */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-wrap gap-2 mb-10 bg-white/5 p-2 rounded-2xl w-fit border border-white/5">
                {MARKET_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${selectedCat === cat.id ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                    <cat.icon size={16} /> {cat.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MARKET_ITEMS.filter(item => item.cat === selectedCat).map(item => {
                  const category = MARKET_CATEGORIES.find(c => c.id === item.cat) || MARKET_CATEGORIES[0];
                  return (
                    <div key={item.id} className="bg-[#141414] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-orange-500/30 transition-all group">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-6 shadow-lg`}><category.icon size={18} /></div>
                      <h3 className="text-xl font-black text-white mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-500 mb-8 leading-relaxed font-medium">{item.detail}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-lg font-black text-white font-mono">KES {item.price.toLocaleString()}</span>
                        <button onClick={() => setCheckout(item)} className="bg-white text-black font-black px-4 py-2.5 rounded-xl hover:bg-orange-500 hover:text-white transition-all text-[10px] uppercase">Select</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-white mb-8 italic uppercase">Active Nodes</h1>
              {userData.inventory.length > 0 ? userData.inventory.map((item, idx) => (
                <div key={idx} className="bg-[#141414] border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-orange-500 border border-white/10"><Activity size={18} /></div><div><p className="font-black text-white">{item.name}</p><p className="text-[9px] text-slate-500 uppercase font-mono">ID: {item.uid}</p></div></div>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase">Active</span>
                </div>
              )) : (
                <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                  <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">No Active Nodes</p>
                </div>
              )}
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === 'history' && (
            <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest"><tr className="border-b border-white/5"><th className="p-6">Asset</th><th className="p-6">Trace ID</th><th className="p-6 text-right">Debit</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {userData.logs.map((log, i) => (
                      <tr key={i} className="text-xs font-medium"><td className="p-6 text-white">{log.item}</td><td className="p-6 text-orange-400 font-mono text-[10px] uppercase tracking-widest">{log.tx}</td><td className="p-6 text-right font-black">KES {log.price}</td></tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </main>

      {/* CHECKOUT MODAL */}
      {checkout && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setCheckout(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"><X size={20}/></button>
            <div className="text-center mb-8">
              <Smartphone size={32} className="text-green-500 mx-auto mb-4" />
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">M-Pesa Verification</p>
              <p className="text-3xl font-black text-white mb-4">0781032460</p>
              <div className="bg-orange-500/10 py-3 rounded-2xl border border-orange-500/20 mb-8"><p className="text-orange-500 font-black text-2xl font-mono">KES {checkout.price.toLocaleString()}</p></div>
              <input type="text" placeholder="TRANSACTION CODE" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white text-center font-mono tracking-[0.3em] mb-4 focus:border-orange-500 outline-none uppercase" value={proof} onChange={(e) => setProof(e.target.value)} />
              <button onClick={handleVerify} disabled={!proof || loading} className="w-full py-5 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-20">{loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Verify Payment"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}