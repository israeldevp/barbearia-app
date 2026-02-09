
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Clock, Scissors, Phone, Search, UserCheck } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { Client, Employee } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (clientName: string, timestamp: Date, serviceName: string, employeeName: string, phone?: string) => void;
  clients: Client[];
  employees: Employee[];
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, onConfirm, clients, employees }) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [employeeName, setEmployeeName] = useState(employees[0]?.name || '');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hour, setHour] = useState(new Date().getHours().toString().padStart(2, '0'));
  const [minute, setMinute] = useState('00');
  
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (employees.length > 0 && !employeeName) {
      setEmployeeName(employees[0].name);
    }
  }, [employees]);

  useEffect(() => {
    if (clientName.length > 1) {
      const filtered = clients.filter(c => 
        c.name.toLowerCase().includes(clientName.toLowerCase())
      ).slice(0, 4);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [clientName, clients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSelectClient = (client: Client) => {
    setClientName(client.name);
    setPhone(client.phone || '');
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName && hour) {
      let cleanHour = parseInt(hour);
      if (isNaN(cleanHour)) cleanHour = new Date().getHours();
      cleanHour = Math.min(23, Math.max(0, cleanHour));

      const timestamp = new Date(selectedDate);
      timestamp.setHours(cleanHour, parseInt(minute), 0, 0);
      
      onConfirm(clientName, timestamp, serviceName || 'Serviço a definir', employeeName, phone);
      
      setClientName('');
      setPhone('');
      setServiceName('');
      setSelectedDate(new Date());
      setHour(new Date().getHours().toString().padStart(2, '0'));
      setMinute('00');
      onClose();
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHour(e.target.value);
  };

  const handleHourBlur = () => {
    let val = parseInt(hour);
    if (isNaN(val)) val = 0;
    val = Math.min(23, Math.max(0, val));
    setHour(val.toString().padStart(2, '0'));
  };

  const toggleMinute = () => {
    setMinute(prev => prev === '00' ? '30' : '00');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brand-onyx/95 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="w-full sm:w-96 bg-brand-concrete border-t sm:border border-white/10 rounded-t-2xl sm:rounded-xl shadow-2xl transform transition-transform animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 overflow-visible max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-brand-gold"></div>
            <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">Novo Agendamento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-brand-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto no-scrollbar">
          
          {/* Client Input */}
          <div className="space-y-2 relative" ref={suggestionRef}>
            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Cliente
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nome do cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                onFocus={() => clientName.length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full bg-brand-onyx border border-white/10 rounded-lg py-4 px-4 text-white font-sans text-lg focus:border-brand-gold focus:ring-0 transition-all placeholder-brand-muted/30"
                required
                autoComplete="off"
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-concreteDark border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-white/5 bg-brand-onyx/50 text-[9px] text-brand-muted font-black uppercase tracking-widest flex items-center gap-2">
                    <Search className="w-2 h-2" /> Clientes Encontrados
                  </div>
                  {suggestions.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClient(c)}
                      className="w-full text-left p-4 hover:bg-brand-gold/10 transition-colors border-b border-white/5 last:border-0 group"
                    >
                      <p className="font-display font-bold text-white group-hover:text-brand-gold transition-colors">{c.name}</p>
                      {c.phone && <p className="text-[10px] text-brand-muted mt-0.5">{c.phone}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional Phone Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-3 h-3" /> Celular (Opcional)
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-brand-onyx border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-sm focus:border-brand-gold focus:ring-0 transition-all placeholder-brand-muted/20"
            />
          </div>

          {/* Employee Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              <UserCheck className="w-3 h-3" /> Funcionário
            </label>
            <div className="grid grid-cols-2 gap-2">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setEmployeeName(emp.name)}
                  className={`
                    py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all
                    ${employeeName === emp.name 
                      ? 'bg-brand-gold border-brand-gold text-brand-onyx shadow-lg shadow-brand-gold/20' 
                      : 'bg-brand-onyx border-white/10 text-brand-muted hover:border-white/20 hover:text-white'}
                  `}
                >
                  {emp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Service Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              <Scissors className="w-3 h-3" /> Serviço
            </label>
            <input
              type="text"
              placeholder="Ex: Corte + Barba"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-brand-onyx border border-white/10 rounded-lg py-3 px-4 text-brand-gold font-sans font-bold text-sm uppercase tracking-wider focus:border-brand-gold focus:ring-0 transition-all placeholder-brand-muted/30"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
             <DatePicker 
                label="DATA"
                selectedDate={selectedDate}
                onChange={setSelectedDate}
                variant="input"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Horário
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={handleHourChange}
                    onBlur={handleHourBlur}
                    className="w-full bg-brand-onyx border border-white/10 rounded-lg py-4 text-white font-display font-bold text-lg text-center focus:border-brand-gold focus:ring-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-white/20 font-bold text-xl">:</span>
                  <button
                    type="button"
                    onClick={toggleMinute}
                    className="w-full py-4 rounded-lg font-display font-bold text-lg transition-all border bg-brand-gold text-brand-onyx border-brand-gold"
                  >
                    {minute}
                  </button>
                </div>
              </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gold-gradient text-brand-onyx font-display font-black text-sm uppercase tracking-widest py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-brand-gold/10 mt-2"
          >
            Agendar Horário
          </button>
        </form>

      </div>
    </div>
  );
};
