import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, UserPlus, Trash2, Check, TrendingUp, Calendar, Users, Briefcase, BarChart3, PieChart, Landmark, UserCheck, Scissors, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Lock, LogIn } from 'lucide-react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCard';
import { AppointmentList } from './components/AppointmentList';
import { ClientList } from './components/ClientList';
import { CheckpointModal } from './components/CheckpointModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { Appointment, DashboardStats, AppointmentStatus, PaymentMethod, Client, Employee } from './types';
import { MOCK_APPOINTMENTS, MOCK_CLIENTS, MOCK_EMPLOYEES } from './services/mockData';

type ViewState = 'dashboard' | 'agenda' | 'clientes' | 'financeiro' | 'configuracoes';

const App: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard' as ViewState);
  
  const [agendaDate, setAgendaDate] = useState(new Date());
  const [dashboardDate, setDashboardDate] = useState(new Date());

  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [selectedEmployeeReport, setSelectedEmployeeReport] = useState<string | null>(null);
  const [showAllMonths, setShowAllMonths] = useState(false);
  
  // Security state for Settings
  const [isConfigAuthenticated, setIsConfigAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Year navigation for financial closure
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setAppointments([...MOCK_APPOINTMENTS]);
    setClients([...MOCK_CLIENTS]);
    setEmployees([...MOCK_EMPLOYEES]);
  }, []);

  const stats: DashboardStats = useMemo(() => {
    const today = dashboardDate;
    const todayAppointments = appointments.filter(apt => 
      apt.timestamp.getDate() === today.getDate() &&
      apt.timestamp.getMonth() === today.getMonth() &&
      apt.timestamp.getFullYear() === today.getFullYear()
    );

    return todayAppointments.reduce(
      (acc, curr) => {
        if (curr.status !== AppointmentStatus.CANCELED) {
             acc.totalAppointments += 1;
             
             if (curr.status === AppointmentStatus.COMPLETED) {
                acc.completedAppointments += 1;
             }
             
             if (curr.isPaid) {
                acc.totalRevenue += curr.price;
                const empName = curr.employeeName || 'Não Atribuído';
                acc.revenueByEmployee[empName] = (acc.revenueByEmployee[empName] || 0) + curr.price;
             } else if (curr.status !== AppointmentStatus.NO_SHOW) {
                acc.pendingPayment += curr.price;
             }
        }
        
        return acc;
      },
      { totalRevenue: 0, totalAppointments: 0, completedAppointments: 0, pendingPayment: 0, revenueByEmployee: {} as Record<string, number> }
    );
  }, [appointments, dashboardDate]);

  const financialReports = useMemo(() => {
    const annualRevenue = appointments
      .filter(apt => apt.isPaid && apt.timestamp.getFullYear() === financialYear)
      .reduce((sum, apt) => sum + apt.price, 0);

    const annualServices = appointments
      .filter(apt => apt.status === AppointmentStatus.COMPLETED && apt.timestamp.getFullYear() === financialYear).length;

    const monthlyHistory = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = targetDate.getMonth();
      const year = targetDate.getFullYear();

      const monthApts = appointments.filter(apt => 
        apt.timestamp.getMonth() === month && 
        apt.timestamp.getFullYear() === year
      );

      const revenue = monthApts.filter(a => a.isPaid).reduce((sum, a) => sum + a.price, 0);
      const completed = monthApts.filter(a => a.status === AppointmentStatus.COMPLETED).length;
      
      const revenueByEmployee: Record<string, number> = {};
      monthApts.filter(a => a.isPaid).forEach(apt => {
        revenueByEmployee[apt.employeeName] = (revenueByEmployee[apt.employeeName] || 0) + apt.price;
      });

      monthlyHistory.push({
        label: targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        revenue,
        completed,
        month,
        year,
        revenueByEmployee
      });
    }

    return {
      annualRevenue,
      annualServices,
      monthlyHistory
    };
  }, [appointments, financialYear]);

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsModalOpen(true);
  };

  const handleUpdateAppointment = (id: string, finalPrice: number, isPaid: boolean, status?: AppointmentStatus, paymentMethod?: PaymentMethod, serviceName?: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        return { 
          ...apt, 
          price: finalPrice, 
          isPaid,
          status: status || apt.status,
          paymentMethod: paymentMethod,
          serviceName: serviceName || apt.serviceName
        };
      }
      return apt;
    }));
  };

  const handleUpdateClientPhone = (clientId: string, newPhone: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, phone: newPhone } : c));
  };

  const handleQuickToggle = (id: string, currentStatus: boolean) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        const newPaidStatus = !currentStatus;
        return { 
          ...apt, 
          isPaid: newPaidStatus,
          status: newPaidStatus ? AppointmentStatus.COMPLETED : apt.status,
          paymentMethod: newPaidStatus ? (apt.paymentMethod || PaymentMethod.PIX) : undefined
        };
      }
      return apt;
    }));
  };

  const handleCreateAppointment = (clientName: string, timestamp: Date, serviceName: string, employeeName: string, phone?: string) => {
    let existingClient = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    let clientId: string;
    
    if (existingClient) {
      clientId = existingClient.id;
      if (phone && (!existingClient.phone || existingClient.phone === '')) {
          handleUpdateClientPhone(clientId, phone);
      }
    } else {
      clientId = 'new-client-' + Date.now();
      const newClient: Client = {
        id: clientId,
        name: clientName,
        phone: phone || '',
        totalSpent: 0
      };
      setClients(prev => [...prev, newClient]);
    }

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substring(2, 9),
      clientId: clientId,
      clientName,
      employeeName,
      serviceName: serviceName,
      timestamp: timestamp,
      durationMinutes: 30,
      price: 0,
      isPaid: false,
      status: AppointmentStatus.SCHEDULED
    };
    
    setAppointments(prev => [...prev, newAppointment].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
    
    if (currentView === 'agenda') setAgendaDate(timestamp);
    if (currentView === 'dashboard') setDashboardDate(timestamp);
  };

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      const newEmployee: Employee = {
        id: 'emp-' + Date.now(),
        name: newEmployeeName.trim()
      };
      setEmployees(prev => [...prev, newEmployee]);
      setNewEmployeeName('');
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleMenuNavigation = (view: ViewState) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const handleConfigLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === 'admin' && loginPass === 'admin') {
        setIsConfigAuthenticated(true);
        setLoginError(false);
    } else {
        setLoginError(true);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="animate-slide-in">
            <section>
              <SummaryCards stats={stats} employees={employees} showEmployeeStats={false} />
            </section>
            <section className="bg-brand-onyx min-h-[500px]">
              <AppointmentList 
                appointments={appointments} 
                onAppointmentClick={handleAppointmentClick}
                onQuickTogglePay={handleQuickToggle}
                selectedDate={dashboardDate} 
                onDateChange={setDashboardDate}
              />
            </section>
          </div>
        );
      case 'agenda':
        return (
          <section className="bg-brand-onyx min-h-[500px] animate-slide-in">
            <AppointmentList 
              appointments={appointments} 
              onAppointmentClick={handleAppointmentClick}
              onQuickTogglePay={handleQuickToggle}
              selectedDate={agendaDate}
              onDateChange={setAgendaDate}
            />
          </section>
        );
      case 'clientes':
        return <div className="animate-slide-in"><ClientList clients={clients} appointments={appointments} onUpdatePhone={handleUpdateClientPhone} /></div>;
      case 'financeiro':
        const displayedMonths = showAllMonths 
          ? financialReports.monthlyHistory 
          : financialReports.monthlyHistory.slice(0, 3);
        const averageDivisor = financialYear === new Date().getFullYear() ? Math.max(1, new Date().getMonth() + 1) : 12;

        return (
           <div className="pt-6 space-y-12 pb-28 animate-slide-in">
              <div className="px-6 flex items-end justify-between">
                 <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight font-stretch-expanded leading-none">Gestão Financeira</h2>
                 <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Fluxo</p>
              </div>

              <SummaryCards stats={stats} employees={employees} showEmployeeStats={true} onEmployeeClick={(name) => setSelectedEmployeeReport(name)} />
              
              <div className="px-6 space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <h3 className="font-display font-black text-xs text-brand-muted uppercase tracking-[0.2em]">Relatórios Mensais</h3>
                     <div className="flex-1 h-[1px] bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {displayedMonths.map((report, idx) => (
                      <div key={idx} className={`p-5 rounded-xl border transition-all flex items-center justify-between ${idx === 0 ? 'bg-brand-concrete border-brand-gold/20' : 'bg-brand-concreteDark border-white/5'}`}>
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${idx === 0 ? 'bg-brand-gold/10 border-brand-gold/20' : 'bg-brand-onyx border-white/5'}`}>
                               <BarChart3 className={`w-5 h-5 ${idx === 0 ? 'text-brand-gold' : 'text-brand-muted'}`} />
                            </div>
                            <div>
                               <h5 className="font-display font-bold text-white uppercase tracking-wide text-sm leading-tight">{report.label}</h5>
                               <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">{report.completed} Atendimentos</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className={`font-display font-black text-lg ${idx === 0 ? 'text-brand-gold' : 'text-white'}`}>R$ {report.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  {financialReports.monthlyHistory.length > 3 && (
                    <button onClick={() => setShowAllMonths(!showAllMonths)} className="w-full py-4 border border-white/5 bg-brand-concreteDark/50 rounded-xl flex items-center justify-center gap-3 text-brand-muted text-[10px] font-black uppercase tracking-[0.2em]">
                      {showAllMonths ? 'Recolher' : 'Ver Todos os Meses'} {showAllMonths ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                     <h3 className="font-display font-black text-xs text-brand-muted uppercase tracking-[0.2em]">Fechamento Anual {financialYear}</h3>
                     <div className="flex items-center gap-1 bg-brand-onyx border border-white/5 rounded-lg p-1">
                        <button onClick={() => setFinancialYear(financialYear - 1)} className="p-1.5 text-brand-muted"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-[10px] font-black text-white px-1">{financialYear}</span>
                        <button onClick={() => setFinancialYear(financialYear + 1)} disabled={financialYear >= new Date().getFullYear()} className="p-1.5 text-brand-muted disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
                     </div>
                  </div>
                  <div className="bg-gold-gradient p-[1px] rounded-2xl">
                    <div className="bg-brand-concreteDark rounded-[15px] p-6 sm:p-8 relative overflow-hidden">
                       <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em]">Faturamento Bruto</p>
                             <h4 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tighter">R$ {financialReports.annualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                          </div>
                          <div className="bg-brand-onyx/50 border border-white/5 rounded-xl p-4 min-w-[180px] text-center">
                             <p className="text-[10px] font-black text-brand-muted uppercase mb-1">Média Mensal</p>
                             <p className="font-display font-bold text-2xl text-white">R$ {(financialReports.annualRevenue / averageDivisor).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        );
      case 'configuracoes':
        if (!isConfigAuthenticated) {
            return (
                <div className="px-6 pt-20 max-w-sm mx-auto flex flex-col items-center animate-slide-in">
                    <div className="w-20 h-20 rounded-3xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 mb-8">
                        <Lock className="w-10 h-10 text-brand-gold" />
                    </div>
                    <div className="text-center space-y-2 mb-10">
                        <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Área Restrita</h2>
                        <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Acesso Administrativo</p>
                    </div>
                    <form onSubmit={handleConfigLogin} className="w-full space-y-4">
                        <input type="text" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full bg-brand-onyx border border-white/10 rounded-lg px-4 py-4 text-white placeholder-brand-muted/30" placeholder="admin" required />
                        <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full bg-brand-onyx border border-white/10 rounded-lg px-4 py-4 text-white placeholder-brand-muted/30" placeholder="••••••••" required />
                        {loginError && <p className="text-red-500 text-[10px] font-bold uppercase text-center tracking-widest">Acesso Negado</p>}
                        <button type="submit" className="w-full mt-6 bg-gold-gradient text-brand-onyx font-display font-black text-sm uppercase tracking-widest py-5 rounded-xl shadow-xl shadow-brand-gold/10 flex items-center justify-center gap-2"><LogIn className="w-5 h-5" /> Entrar</button>
                    </form>
                </div>
            );
        }
        return (
           <div className="px-6 pt-10 max-w-lg mx-auto space-y-12 animate-slide-in">
              <div className="text-center space-y-3">
                <h2 className="font-display text-3xl font-black text-white uppercase tracking-tight">Configurações</h2>
                <p className="text-brand-muted text-[10px] font-bold uppercase tracking-[0.3em]">Equipe e Sistema</p>
              </div>
              <div className="space-y-8">
                <div className="flex items-center justify-between border-l-4 border-brand-gold pl-4">
                   <h3 className="font-display font-black text-sm text-white uppercase tracking-widest">Gestão de Equipe</h3>
                   <button onClick={() => { setIsConfigAuthenticated(false); setLoginPass(''); }} className="p-2 bg-brand-onyx border border-white/5 rounded-lg text-[9px] font-black text-brand-muted uppercase flex items-center gap-2"><Lock className="w-3 h-3" /> Logout</button>
                </div>
                <div className="flex gap-3">
                   <input type="text" placeholder="Nome do Funcionário" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} className="flex-1 bg-brand-onyx border border-white/10 rounded-xl px-5 py-4 text-white text-sm" />
                   <button onClick={handleAddEmployee} className="bg-brand-gold text-brand-onyx w-14 rounded-xl flex items-center justify-center shadow-lg shadow-brand-gold/10"><UserPlus className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                   {employees.map(emp => (
                      <div key={emp.id} className="bg-brand-concreteDark border border-white/5 p-5 rounded-2xl flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-onyx flex items-center justify-center border border-white/10"><Check className="w-5 h-5 text-brand-gold" /></div>
                            <span className="font-display font-black text-brand-text uppercase tracking-[0.1em] text-sm">{emp.name}</span>
                         </div>
                         <button onClick={() => handleDeleteEmployee(emp.id)} className="w-10 h-10 flex items-center justify-center text-brand-muted hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                   ))}
                </div>
              </div>
              <div className="pt-20 border-t border-white/5 opacity-50 text-center"><p className="text-[10px] text-brand-muted uppercase tracking-[0.5em] font-black">Barbearia Robson Perrot v1.2</p></div>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-onyx pb-10 font-sans relative overflow-x-hidden">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <main className="space-y-8 pt-4">{renderContent()}</main>
      {(currentView === 'dashboard' || currentView === 'agenda') && (
        <div className="fixed bottom-10 right-6 z-30">
          <button onClick={() => setIsNewAppointmentModalOpen(true)} className="w-16 h-16 bg-gold-gradient text-brand-onyx rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)] border border-brand-gold/50"><Plus className="w-9 h-9" strokeWidth={3} /></button>
        </div>
      )}
      <CheckpointModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} appointment={selectedAppointment} onConfirm={handleUpdateAppointment} />
      <NewAppointmentModal isOpen={isNewAppointmentModalOpen} onClose={() => setIsNewAppointmentModalOpen(false)} onConfirm={handleCreateAppointment} clients={clients} employees={employees} />
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-onyx/98 backdrop-blur-sm flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-end mb-8"><button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-xl bg-brand-concrete flex items-center justify-center border border-white/5"><X className="w-6 h-6 text-brand-text" /></button></div>
          <nav className="flex flex-col gap-6 items-center justify-center h-full pb-20">
            {['dashboard', 'agenda', 'clientes', 'financeiro', 'configuracoes'].map((id) => (
              <button key={id} onClick={() => handleMenuNavigation(id as ViewState)} className={`font-display font-black text-4xl uppercase tracking-tighter transition-colors ${currentView === id ? 'text-brand-gold' : 'text-white'}`}>{id}</button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
export default App;