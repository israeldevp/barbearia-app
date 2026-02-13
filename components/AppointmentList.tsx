import { AlertTriangle, Trash2 } from 'lucide-react';
import { Appointment, AppointmentStatus, Client } from '../types';
import { DatePicker } from './DatePicker';

interface AppointmentListProps {
  appointments: Appointment[];
  clients: Client[];
  onAppointmentClick: (appointment: Appointment) => void;
  onQuickTogglePay: (id: string, currentStatus: boolean) => void;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  clients,
  onAppointmentClick,
  onQuickTogglePay,
  selectedDate,
  onDateChange
}) => {

  // Use provided date or default to today
  const activeDate = selectedDate || new Date();

  // Filter appointments for the specific day
  const dailyAppointments = appointments.filter(apt => {
    return (
      apt.timestamp.getDate() === activeDate.getDate() &&
      apt.timestamp.getMonth() === activeDate.getMonth() &&
      apt.timestamp.getFullYear() === activeDate.getFullYear()
    );
  });

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'FEITO';
      case AppointmentStatus.SCHEDULED:
        return 'AGENDA';
      case AppointmentStatus.CANCELED:
        return 'CANCELADO';
      case AppointmentStatus.NO_SHOW:
        return 'FALTOU';
      default:
        return status;
    }
  };

  const getClientMismatch = (apt: Appointment) => {
    if (!apt.clientId) return null;
    const client = clients.find(c => c.id === apt.clientId);
    if (!client) return null;

    // Normalizing strings for comparison
    const aptName = apt.clientName.trim().toLowerCase();
    const clientName = client.name.trim().toLowerCase();

    if (aptName !== clientName) {
      return { type: 'mismatch', name: client.name };
    }
    if (client.deleted_at) {
      return { type: 'deleted', name: client.name };
    }
    return null;
  };

  // Calculate Remaining & Next Appointment
  const now = new Date();
  const remainingCount = dailyAppointments.filter(
    apt => apt.status === AppointmentStatus.SCHEDULED && apt.timestamp > now
  ).length;

  const nextAppointment = dailyAppointments
    .filter(apt => apt.status === AppointmentStatus.SCHEDULED && apt.timestamp > now)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];

  return (
    <div className="px-6 pb-28 pt-4">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight font-stretch-expanded">Timeline</h2>
          {/* Daily Summary Badge */}
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-brand-onyx border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></div>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                Restam <span className="text-white">{remainingCount}</span> atendimentos hoje
              </span>
            </div>
          </div>
        </div>

        {/* Custom Date Picker Component */}
        <DatePicker
          selectedDate={activeDate}
          onChange={onDateChange}
          variant="header"
        />
      </div>

      {/* List */}
      <div className="space-y-6">
        {dailyAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <div className="w-12 h-1 bg-white/10 mb-4 rounded-full"></div>
            <p className="text-brand-muted font-bold uppercase text-xs tracking-widest">Sem agendamentos</p>
          </div>
        ) : (
          dailyAppointments.map((apt) => {
            const clientStatus = getClientMismatch(apt);
            const isNext = nextAppointment?.id === apt.id;
            const isNoShow = apt.status === AppointmentStatus.NO_SHOW;

            return (
              <div
                key={apt.id}
                className={`relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-[1px] ${isNext ? 'before:bg-brand-text/30' : 'before:bg-white/10'} last:before:hidden`}
              >
                {/* Timeline Geometric Marker */}
                <div className={`absolute left-0 top-1 w-6 h-6 flex items-center justify-center bg-brand-onyx border z-10 rotate-45 transition-colors
                    ${isNext ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110' : 'border-brand-concrete'}
                    ${isNoShow ? 'border-red-500/30' : ''}
                  `}>
                  <div className={`w-2 h-2 transition-colors
                      ${apt.isPaid ? 'bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-brand-concrete'}
                      ${isNext && !apt.isPaid ? 'bg-white' : ''}
                      ${isNoShow ? 'bg-red-500/50' : ''}
                    `} />
                </div>

                {/* Card - Blocky Concrete Style */}
                <div
                  onClick={() => onAppointmentClick(apt)}
                  className={`
                    relative p-5 rounded-lg border transition-all cursor-pointer group
                    ${apt.isPaid
                      ? 'bg-brand-concrete/40 border-brand-gold/20'
                      : isNoShow
                        ? 'bg-brand-concreteDark border-red-500/10 opacity-60 hover:opacity-100 hover:border-red-500/30'
                        : isNext
                          ? 'bg-brand-concrete border-white/20 shadow-lg'
                          : 'bg-brand-concreteDark border-white/5 hover:border-white/10'
                    }
                  `}
                >
                  {/* Next Badge */}
                  {isNext && (
                    <div className="absolute -top-3 right-4 bg-brand-text text-brand-onyx text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                      Próximo
                    </div>
                  )}

                  {/* Time & Price Row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs px-2 py-1 rounded border ${isNoShow ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'text-brand-muted bg-brand-onyx border-white/5'}`}>
                        {apt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {clientStatus?.type === 'mismatch' && (
                        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" />
                          Nome Diferente
                        </div>
                      )}
                      {clientStatus?.type === 'deleted' && (
                        <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-[10px] text-red-500 font-bold uppercase tracking-wider">
                          <Trash2 className="w-3 h-3" />
                          Excluído
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-display font-bold text-lg ${apt.isPaid ? 'text-brand-gold' : isNoShow ? 'text-red-500/50 line-through decoration-red-500/50' : 'text-white'}`}>
                        R$ {apt.price.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Client, Service & Employee */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-sans font-bold text-lg leading-tight ${isNoShow ? 'text-brand-muted line-through decoration-red-500/30' : 'text-brand-text'}`}>{apt.clientName}</h3>
                        {clientStatus?.type === 'mismatch' && (
                          <p className="text-[10px] text-brand-muted">Cadastro: <span className="text-white">{clientStatus.name}</span></p>
                        )}
                      </div>
                      {apt.status !== AppointmentStatus.NO_SHOW ? (
                        <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">{apt.serviceName}</span>
                      ) : (
                        <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Não Compareceu</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <div className={`w-1 h-1 rounded-full ${isNoShow ? 'bg-red-500' : 'bg-brand-gold'}`}></div>
                      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Atendido por: <span className="text-white">{apt.employeeName}</span></p>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className={`mt-5 flex justify-between items-center pt-4 border-t border-dashed ${isNoShow ? 'border-red-500/10' : 'border-white/5'}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-[0.1em] ${apt.status === AppointmentStatus.NO_SHOW ? 'text-red-500 font-bold' : 'text-brand-muted'}`}>
                      {getStatusLabel(apt.status)}
                    </span>

                    {/* Quick Toggle - Geometric Button */}
                    {!isNoShow && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickTogglePay(apt.id, apt.isPaid);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all border ${apt.isPaid
                          ? 'bg-brand-gold text-brand-onyx border-brand-gold'
                          : 'bg-transparent text-brand-muted border-white/10 hover:border-brand-gold hover:text-brand-gold'
                          }`}
                      >
                        {apt.isPaid ? 'Pago' : 'Receber'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
