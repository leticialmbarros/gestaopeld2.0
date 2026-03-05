import React, { useState } from 'react';
import { PlusCircle, LayoutDashboard, User, Target, ShieldAlert, ListPlus, History, Menu, X, ExternalLink } from 'lucide-react';
import CusteioForm from './components/CusteioForm';
import BolsaForm from './components/BolsaForm';
import DashboardView from './components/DashboardView';
import MetasTracker from './components/MetasTracker';
import Compliance from './components/Compliance';
import HistoricoLancamentos from './components/HistoricoLancamentos';

export type UserRole = 'Administrador' | 'Coordenador' | 'Pesquisador';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'lancamentos' | 'custeio' | 'bolsa' | 'metas' | 'compliance' | 'historico'>('dashboard');
  const [email, setEmail] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine role based on email
  const role: UserRole = email.toLowerCase() === 'm.leticia10@pucrs.br' 
    ? 'Administrador' 
    : (email.toLowerCase() === 'eduardo.eizirik@pucrs.br' ? 'Coordenador' : (email ? 'Pesquisador' : 'Pesquisador'));

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // If they lose admin access and are on a restricted view, redirect to dashboard
    if (newEmail.toLowerCase() !== 'm.leticia10@pucrs.br' && (view === 'lancamentos' || view === 'custeio' || view === 'bolsa' || view === 'historico')) {
      setView('dashboard');
    }
  };

  const navigateTo = (targetView: any) => {
    setView(targetView);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const NavItem = ({ icon: Icon, label, targetView, restricted = false }: any) => {
    if (restricted && role !== 'Administrador') return null;
    
    const isActive = view === targetView || (targetView === 'lancamentos' && (view === 'custeio' || view === 'bolsa'));
    
    return (
      <button
        onClick={() => navigateTo(targetView)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
          isActive 
            ? 'bg-emerald-800 text-white' 
            : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
        }`}
      >
        <Icon size={20} />
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#064e3b] text-white flex items-center justify-between px-4 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-emerald-800 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold tracking-tight">PELD Pró-Mata</h1>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#064e3b] text-white flex flex-col shadow-xl flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight text-white">PELD Pró-Mata</h1>
          <p className="text-emerald-300 text-xs mt-1 font-medium tracking-wider uppercase">Gestão Administrativa</p>
        </div>
        
        {/* Mobile Header inside Sidebar */}
        <div className="p-6 md:hidden flex justify-between items-center border-b border-emerald-800/50">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Menu</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-emerald-800 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" targetView="dashboard" />
          <NavItem icon={Target} label="Metas" targetView="metas" />
          <NavItem icon={ShieldAlert} label="Compliance" targetView="compliance" />
          <NavItem icon={ListPlus} label="Novo Lançamento" targetView="lancamentos" restricted={true} />
          <NavItem icon={History} label="Histórico" targetView="historico" restricted={true} />
          
          <div className="pt-4 mt-4 border-t border-emerald-800/50">
            <a
              href="https://peldgestaoadm.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
            >
              <ExternalLink size={20} />
              PELD Solicitações
            </a>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-emerald-800/50">
          <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">Acesso</span>
            </div>
            <input 
              type="text" 
              name="admin_email_check"
              autoComplete="new-password"
              data-1p-ignore
              placeholder="Seu e-mail..."
              value={email}
              onChange={handleEmailChange}
              className="w-full bg-emerald-950/50 text-sm text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-emerald-700 border border-emerald-800"
            />
            <div className="mt-2 text-xs text-emerald-400 font-medium">
              Perfil: <span className="text-white">{role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {view === 'dashboard' && <DashboardView role={role} />}
          {view === 'metas' && <MetasTracker />}
          {view === 'compliance' && <Compliance />}
          {role === 'Administrador' && view === 'historico' && <HistoricoLancamentos />}

          {role === 'Administrador' && view === 'lancamentos' && (
            <div className="flex flex-col items-center justify-center mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-semibold text-slate-800">Qual o tipo de lançamento?</h2>
              <div className="flex gap-6">
                <button
                  onClick={() => setView('custeio')}
                  className="w-56 h-40 flex flex-col items-center justify-center gap-4 bg-white border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-700 rounded-2xl shadow-sm hover:shadow-md transition-all text-xl font-medium"
                >
                  <ListPlus size={32} />
                  Custeio
                </button>
                <button
                  onClick={() => setView('bolsa')}
                  className="w-56 h-40 flex flex-col items-center justify-center gap-4 bg-white border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-700 rounded-2xl shadow-sm hover:shadow-md transition-all text-xl font-medium"
                >
                  <User size={32} />
                  Bolsa
                </button>
              </div>
            </div>
          )}

          {role === 'Administrador' && view === 'custeio' && <CusteioForm onBack={() => setView('lancamentos')} />}
          {role === 'Administrador' && view === 'bolsa' && <BolsaForm onBack={() => setView('lancamentos')} />}
        </div>
      </main>
    </div>
  );
}
