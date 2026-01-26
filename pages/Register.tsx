import React, { useState } from 'react';
import { Screen } from '../App';

interface RegisterProps {
    onNavigate: (screen: Screen) => void;
    onRegister: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate, onRegister }) => {
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear error when typing
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Mínimo de 8 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            // Mock registration logic
            alert(`Cadastro realizado com sucesso! Bem-vindo, ${formData.name}.`);
            onRegister();
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col justify-center items-center font-display bg-[#221010] text-white">
            {/* Background Layer (Consistent with Login) */}
            <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat transform scale-105"
                    style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCA6c_kHAjo4v5J9dz08M8luixki67_Cb9qKrsnZhZ80Ghjkaa_b_j32nSPrbuBDeD8sPcKIfozGoWLOFb2cZOuZn-Ehg5cEIQfqZGh5gQZCmCHC8u2cBImtnFPQqCoGVJQlgWNe7MeXzHyRCIoDlJPLgNKCSWUTe-IHwtwNJyEf9j6jYmbq_8y4duyu6CD2FOBnKRMOQtD8pdDE9A4bJKx7wLk1aPd8dVebNQo1dGlguyXN1i_jNSGT2GbQe7E36LhhyHBDfnRwAMd")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-60"></div>
            </div>

            <div className="relative z-10 w-full max-w-[480px] p-4 flex flex-col items-center animate-fade-in">
                <div className="mb-6 text-center">
                    <h1 className="text-4xl font-black tracking-tighter leading-none text-white drop-shadow-xl italic">
                        REGISTRO
                    </h1>
                    <p className="text-[#b99d9d] font-medium mt-1 tracking-wide uppercase text-xs">Junte-se à arena</p>
                </div>

                <div className="w-full bg-[#180a0a]/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-8 flex flex-col gap-4">

                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1" htmlFor="name">Nome Completo</label>
                            <input
                                className={`w-full h-12 pl-4 pr-4 bg-black/40 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-normal`}
                                id="name"
                                placeholder="Ex: Anderson Silva"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && <span className="text-red-500 text-[10px] ml-1">{errors.name}</span>}
                        </div>

                        {/* Nickname */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1" htmlFor="nickname">Apelido (Opcional)</label>
                            <input
                                className="w-full h-12 pl-4 pr-4 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-normal"
                                id="nickname"
                                placeholder="Ex: Spider"
                                type="text"
                                value={formData.nickname}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1" htmlFor="email">E-mail</label>
                            <input
                                className={`w-full h-12 pl-4 pr-4 bg-black/40 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-normal`}
                                id="email"
                                placeholder="seu@email.com"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <span className="text-red-500 text-[10px] ml-1">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1" htmlFor="password">Senha</label>
                            <input
                                className={`w-full h-12 pl-4 pr-4 bg-black/40 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-normal`}
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password ? (
                                <span className="text-red-500 text-[10px] ml-1">{errors.password}</span>
                            ) : (
                                <span className="text-gray-600 text-[10px] ml-1">Mínimo 8 caracteres</span>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1" htmlFor="confirmPassword">Confirmar Senha</label>
                            <input
                                className={`w-full h-12 pl-4 pr-4 bg-black/40 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-normal`}
                                id="confirmPassword"
                                placeholder="••••••••"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <span className="text-red-500 text-[10px] ml-1">{errors.confirmPassword}</span>}
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full h-14 mt-2 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-lg shadow-[0_0_20px_rgba(236,19,19,0.3)] hover:shadow-[0_0_30px_rgba(236,19,19,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center gap-2 group"
                        >
                            <span>CRIAR CONTA</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">person_add</span>
                        </button>

                        {/* Google Logic Reuse */}
                        <div className="flex items-center gap-4 my-1">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">ou</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <button
                            onClick={onRegister}
                            className="w-full h-12 bg-white hover:bg-gray-100 text-black font-bold text-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-full h-full">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <span className="tracking-wide uppercase">Cadastrar com Google</span>
                        </button>

                    </div>

                    <div className="px-8 py-4 bg-black/20 border-t border-white/5 flex justify-center">
                        <p className="text-sm text-gray-400">
                            Já tem uma conta?
                            <button
                                onClick={() => onNavigate('login')}
                                className="text-white font-bold hover:text-primary hover:underline transition-all ml-1 uppercase"
                            >
                                Fazer Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
