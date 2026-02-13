import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date;
  onChange?: (date: Date) => void;
  variant?: 'input' | 'header'; // 'input' for forms, 'header' for timeline
  label?: string;
}

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, variant = 'input', label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewDate(new Date(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    if (onChange) {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateToCheck = new Date(year, month, day);
      const isSelected = isSameDay(dateToCheck, selectedDate);
      const isCurrentDay = isToday(dateToCheck);

      days.push(
        <button
          key={day}
          onClick={(e) => { e.preventDefault(); handleDateClick(day); }}
          className={`
            h-9 w-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all
            ${isSelected
              ? 'bg-brand-gold text-brand-onyx shadow-lg shadow-brand-gold/20'
              : 'text-brand-text hover:bg-white/5 hover:text-white'
            }
            ${isCurrentDay && !isSelected ? 'border border-brand-gold/30 text-brand-gold' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // FORMAT DISPLAY TEXT
  const formatDisplay = () => {
    if (isToday(selectedDate)) return "HOJE";
    return selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2 mb-2">
          <CalendarIcon className="w-3 h-3" /> {label}
        </label>
      )}

      {/* TRIGGER BUTTON */}
      {variant === 'input' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full bg-brand-onyx border rounded-lg py-4 px-4 text-white font-sans text-lg 
            flex items-center justify-between transition-all group
            ${isOpen ? 'border-brand-gold ring-1 ring-brand-gold/50' : 'border-white/10 hover:border-white/20'}
          `}
        >
          <span className="font-display font-medium tracking-wide">{formatDisplay()}</span>
          <ChevronDown className={`w-5 h-5 text-brand-muted transition-transform ${isOpen ? 'rotate-180 text-brand-gold' : ''}`} />
        </button>
      ) : (
        // Header Variant (for Timeline)
        <button
          onClick={() => onChange && setIsOpen(!isOpen)}
          className={`
            flex items-center gap-3 bg-brand-concreteDark rounded-full pl-5 pr-3 py-2 border transition-all
            ${isOpen ? 'border-brand-gold text-brand-gold' : 'border-white/5 text-brand-muted hover:border-white/20 hover:text-white'}
            ${!onChange ? 'cursor-default opacity-100' : 'cursor-pointer'}
          `}
        >
          <span className="text-xs font-bold uppercase tracking-widest min-w-[60px] text-center">
            {isToday(selectedDate) ? 'HOJE' : selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).toUpperCase().replace('.', '')}
          </span>
          <div className={`p-1 rounded-full ${isOpen ? 'bg-brand-gold text-brand-onyx' : 'bg-brand-onyx border border-white/5'}`}>
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
        </button>
      )}

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div className={`
          absolute z-50 mt-2 p-4 bg-brand-concrete border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200
          ${variant === 'header' ? 'right-0 origin-top-right w-72' : 'left-0 w-full min-w-[280px]'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white/5 rounded text-brand-muted hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-display font-bold text-white uppercase tracking-wide">
              {MONTHS[viewDate.getMonth()]} <span className="text-brand-muted">{viewDate.getFullYear()}</span>
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white/5 rounded text-brand-muted hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => (
              <div key={i} className="h-8 flex items-center justify-center text-[10px] font-bold text-brand-muted/50 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Today Shortcut */}
          {!isToday(selectedDate) && (
            <button
              onClick={() => { onChange && onChange(new Date()); setIsOpen(false); }}
              className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-brand-gold uppercase tracking-widest transition-colors"
            >
              Voltar para Hoje
            </button>
          )}
        </div>
      )}
    </div>
  );
};