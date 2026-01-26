import React, { useState } from 'react';
import { Screen } from '../App';

interface ForgotPasswordProps {
    onNavigate: (screen: Screen) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = () => {
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setError('Por favor, insira um e-mail válido.');
            return;
        }

        // Mock API call
        setError('');
        setSuccess(true);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col justify-center items-center font-display bg-[#221010] text-white">
            {/* Background Layer (Consistent) */}
            <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat transform scale-105"
                    style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCA6c_kHAjo4v5J9dz08M8luixki67_Cb9qKrsnZhZ80Ghjkaa_b_j32nSPrbuBDeD8sPcKIfozGoWLOFb2cZOuZn-Ehg5cEIQfqZGh5gQZCmCHC8u2cBImtnFPQqCoGVJQlgWNe7MeXzHyRCIoDlJPLgNKCSWUTe-IHwtwNJyEf9j6jYmbq_8y4duyu6CD2FOBnKRMOQtD8pdDE9A4bJKx7wLk1aPd8dVebNQo1dGlguyXN1i_jNSGT2GbQe7E36LhhyHBDfnRwAMd")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-60"></div>
            </div>

            <div className="relative z-10 w-full max-w-[480px] p-4 flex flex-col items-center animate-fade-in">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tighter leading-none text-white drop-shadow-xl italic">
                        RECUPERAR SENHA
                    </h1>
                    <p className="text-[#b99d9d] font-medium mt-2 tracking-wide uppercase text-sm">Problemas para entrar?</p>
                </div>

                <div className="w-full bg-[#180a0a]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-8 flex flex-col gap-6">

                        {!success ? (
                            <>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Insira o e-mail associado à sua conta e enviaremos um link seguro para você redefinir sua senha.
                                </p>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-300 ml-1" htmlFor="email">E-mail</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">mail</span>
                                        </div>
                                        <input
                                            className={`w-full h-14 pl-12 pr-4 bg-black/40 border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 font-normal`}
                                            id="email"
                                            placeholder="seu@email.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    {error && <span className="text-red-500 text-xs ml-1">{error}</span>}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-lg shadow-[0_0_20px_rgba(236,19,19,0.3)] hover:shadow-[0_0_30px_rgba(236,19,19,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center gap-2 group"
                                >
                                    <span>ENVIAR LINK</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-center gap-4 py-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-2 animate-bounce">
                                    <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                                </div>
                                <h3 className="text-xl font-bold text-white uppercase font-condensed">E-mail Enviado!</h3>
                                <p className="text-sm text-gray-300">
                                    Verifique sua caixa de entrada (e spam) em <strong>{email}</strong> para prosseguir com a recuperação.
                                </p>
                            </div>
                        )}

                    </div>

                    <div className="px-8 py-4 bg-black/20 border-t border-white/5 flex justify-center">
                        <button
                            onClick={() => onNavigate('login')}
                            className="flex items-center gap-2 text-gray-400 font-bold hover:text-white transition-colors text-sm uppercase tracking-wide"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Voltar para Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
