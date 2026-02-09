import React from 'react';
import { Menu, Crown } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex items-center justify-between px-6 py-6 bg-brand-onyx sticky top-0 z-20 border-b border-white/5 backdrop-blur-md bg-opacity-90">
      
      {/* Brand Identity - Minimalist Geometric */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Crown className="w-6 h-6 text-brand-gold" strokeWidth={2.5} />
            {/* Geometric Accent underneath */}
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-brand-gold"></div>
          </div>
          <h1 className="font-display font-black text-xl tracking-tighter uppercase text-white font-stretch-expanded leading-none">
            Robson<span className="text-brand-gold">Perrot</span>
          </h1>
        </div>
        <p className="text-[10px] text-brand-muted tracking-[0.2em] uppercase font-bold mt-1 ml-8">Barbearia</p>
      </div>
      
      {/* Navigation Actions */}
      <div className="flex gap-5">
        <button onClick={onMenuClick} className="relative group cursor-pointer">
           <div className="w-10 h-10 rounded-lg bg-brand-concrete flex items-center justify-center border border-white/5 group-hover:border-brand-gold/50 transition-colors">
             <Menu className="w-5 h-5 text-brand-text group-hover:text-brand-gold transition-colors" />
           </div>
        </button>
      </div>
    </header>
  );
};