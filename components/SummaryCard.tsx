
import React from 'react';
import { DollarSign, Calendar, TrendingUp, UserCheck } from 'lucide-react';
import { DashboardStats, Employee } from '../types';

interface SummaryCardsProps {
  stats: DashboardStats;
  employees?: Employee[];
  showEmployeeStats?: boolean;
  onEmployeeClick?: (employeeName: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, employees = [], showEmployeeStats = true, onEmployeeClick }) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full overflow-x-auto no-scrollbar py-4 pl-6">
        <div className="flex gap-4 min-w-max pr-6">
          
          {/* Revenue Card */}
          <div className="bg-brand-concrete relative overflow-hidden p-6 rounded-xl w-64 border border-white/10 shadow-2xl flex flex-col justify-between h-40 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
            
            <div className="flex justify-between items-start z-10">
              <span className="font-display text-xs font-bold text-brand-muted uppercase tracking-[0.15em] font-stretch-expanded">Faturamento</span>
              <div className="p-2 bg-brand-onyx rounded-md border border-white/5">
                < DollarSign className="w-4 h-4 text-brand-gold" />
              </div>
            </div>
            
            <div className="z-10">
              <span className="font-display text-3xl font-black text-white tracking-tight">
                R$ {stats.totalRevenue.toFixed(2)}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-brand-muted font-medium uppercase tracking-wide">Tempo Real</p>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-brand-concreteDark p-6 rounded-xl w-48 border border-white/5 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="font-display text-xs font-bold text-brand-muted uppercase tracking-[0.15em] font-stretch-expanded">A Receber</span>
              <TrendingUp className="w-4 h-4 text-brand-muted" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-brand-text tracking-tight">
                R$ {stats.pendingPayment.toFixed(2)}
              </span>
              <p className="text-xs text-brand-muted mt-2 font-mono uppercase tracking-tighter">ESTIMADO HOJE</p>
            </div>
          </div>

          {/* Schedule Count */}
          <div className="bg-brand-concreteDark p-6 rounded-xl w-48 border border-white/5 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="font-display text-xs font-bold text-brand-muted uppercase tracking-[0.15em] font-stretch-expanded">Agenda</span>
              <Calendar className="w-4 h-4 text-brand-muted" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-brand-text tracking-tight">
                {stats.completedAppointments}/{stats.totalAppointments}
              </span>
              <p className="text-xs text-brand-muted mt-2 font-mono uppercase tracking-tighter">CLIENTES HOJE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Highlight Section */}
      {showEmployeeStats && (
        <div className="px-6 space-y-4">
          <h3 className="font-display font-black text-[11px] text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2">
            Desempenho da Equipe (Hoje)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const revenue = stats.revenueByEmployee[emp.name] || 0;
              return (
                <button 
                  key={emp.id} 
                  onClick={() => onEmployeeClick?.(emp.name)}
                  className="bg-brand-concreteDark border border-white/5 rounded-xl p-5 flex flex-col gap-3 text-left hover:border-brand-gold/40 hover:bg-brand-concrete/30 transition-all group shadow-lg"
                >
                  <div className="flex items-center gap-2 text-brand-muted group-hover:text-brand-gold transition-colors">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{emp.name} HOJE</span>
                  </div>
                  <div className="font-display font-black text-xl text-white">
                    R$ {revenue.toFixed(2)}
                  </div>
                </button>
              );
            })}
            {employees.length === 0 && (
              <p className="col-span-full text-brand-muted text-[10px] uppercase tracking-widest text-center py-4 bg-brand-onyx/50 rounded-xl border border-dashed border-white/5">
                Nenhum funcionário cadastrado
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
