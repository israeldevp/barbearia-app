import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Mail, Loader2, AlertCircle, Calendar, User, ArrowRight, CheckCircle2, X } from 'lucide-react';

export function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showRequestAccess, setShowRequestAccess] = useState(false);

    // Request Access Form State
    const [reqName, setReqName] = useState('');
    const [reqEmail, setReqEmail] = useState('');
    const [reqPhone, setReqPhone] = useState('');
    const [reqReason, setReqReason] = useState('');
    const [requestSuccess, setRequestSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('access_requests')
                .insert({
                    name: reqName,
                    email: reqEmail,
                    phone: reqPhone,
                    reason: reqReason,
                    status: 'pending'
                });

            if (error) throw error;
            setRequestSuccess(true);
        } catch (err: any) {
            console.error('Error requesting access:', err);
            setError('Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handlePublicBooking = () => {
        window.history.pushState({}, '', '/agendar');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    if (showRequestAccess) {
        return (
            <div className="min-h-screen bg-brand-onyx flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-brand-concreteDark border border-white/5 rounded-2xl p-8 pos-relative animate-in zoom-in duration-300">
                    <button
                        onClick={() => { setShowRequestAccess(false); setRequestSuccess(false); setError(null); }}
                        className="absolute top-4 right-4 text-brand-muted hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-2">Solicitar Acesso</h2>
                        <p className="text-brand-muted text-xs">Preencha seus dados para solicitar acesso à área administrativa.</p>
                    </div>

                    {requestSuccess ? (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-2">Solicitação Enviada!</h3>
                                <p className="text-brand-muted text-sm">Aguarde a aprovação do administrador. Você será notificado.</p>
                            </div>
                            <button
                                onClick={() => setShowRequestAccess(false)}
                                className="text-brand-gold font-bold text-sm uppercase hover:text-white transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRequestAccess} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                value={reqName}
                                onChange={e => setReqName(e.target.value)}
                                className="w-full bg-brand-onyx border border-white/10 rounded-xl p-4 text-white text-sm focus:border-brand-gold outline-none"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={reqEmail}
                                onChange={e => setReqEmail(e.target.value)}
                                className="w-full bg-brand-onyx border border-white/10 rounded-xl p-4 text-white text-sm focus:border-brand-gold outline-none"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Telefone / WhatsApp"
                                value={reqPhone}
                                onChange={e => setReqPhone(e.target.value)}
                                className="w-full bg-brand-onyx border border-white/10 rounded-xl p-4 text-white text-sm focus:border-brand-gold outline-none"
                                required
                            />
                            <textarea
                                placeholder="Motivo (Ex: Sou novo barbeiro)"
                                value={reqReason}
                                onChange={e => setReqReason(e.target.value)}
                                className="w-full bg-brand-onyx border border-white/10 rounded-xl p-4 text-white text-sm focus:border-brand-gold outline-none h-24 resize-none"
                            />

                            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold text-brand-onyx font-display font-black text-sm uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Enviar Solicitação'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-onyx flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-onyx via-brand-gold to-brand-onyx opacity-30"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md space-y-8 relative z-10">

                {/* Branding */}
                <div className="text-center space-y-2">
                    <h1 className="font-display font-black text-4xl text-white uppercase tracking-tighter">
                        Barbearia<span className="text-brand-gold">App</span>
                    </h1>
                    <p className="text-brand-muted text-xs font-bold uppercase tracking-[0.3em]">Gestão & Agendamento</p>
                </div>

                {/* Primary Action: Schedule */}
                <button
                    onClick={handlePublicBooking}
                    className="w-full group relative overflow-hidden bg-brand-concreteDark border border-brand-gold/30 hover:border-brand-gold/60 rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-goldDim flex items-center justify-center shadow-lg text-brand-onyx">
                            <Calendar className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight group-hover:text-brand-gold transition-colors">Agendar Horário</h2>
                            <p className="text-brand-muted text-xs mt-2 uppercase tracking-wider font-bold group-hover:text-white transition-colors">Cliente? Clique aqui para reservar</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-brand-gold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all" />
                    </div>
                </button>

                {/* Quick Access / Login Toggle */}
                {!showLogin ? (
                    <div className="text-center space-y-4">
                        <button
                            onClick={() => setShowLogin(true)}
                            className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors px-6 py-3 rounded-full border border-white/5 hover:border-white/10 bg-brand-concreteDark/50 hover:bg-brand-concreteDark text-xs font-bold uppercase tracking-widest"
                        >
                            <User className="w-4 h-4" />
                            Sou da Equipe / Login
                        </button>
                    </div>
                ) : (
                    <div className="bg-brand-concreteDark border border-white/5 rounded-2xl p-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display font-black text-sm text-white uppercase tracking-widest flex items-center gap-2">
                                <Lock className="w-4 h-4 text-brand-gold" /> Área Restrita
                            </h3>
                            <button onClick={() => setShowLogin(false)} className="text-brand-muted hover:text-white"><X className="w-4 h-4" /></button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-brand-onyx border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-brand-muted/30 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 outline-none transition-all"
                                        placeholder="Email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-brand-onyx border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-brand-muted/30 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 outline-none transition-all"
                                        placeholder="Senha"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold text-brand-onyx font-display font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Entrar no Sistema'}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <button
                                onClick={() => setShowRequestAccess(true)}
                                className="text-[10px] items-center gap-1 text-brand-muted hover:text-brand-gold uppercase tracking-wider font-bold transition-colors inline-flex"
                            >
                                Não tem acesso? Solicitar cadastro <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-6 text-center opacity-30">
                <p className="text-[10px] text-brand-muted uppercase tracking-[0.3em] font-black">Barbearia App v1.2</p>
            </div>
        </div>
    );
}
