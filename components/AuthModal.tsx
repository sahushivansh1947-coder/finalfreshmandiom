
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, User, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useApp, requestLocationSilently } from '../App';
import { db } from '../db';
import { auth } from '../auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, notify, authSuccessCallback, setAuthSuccessCallback, setUserLocation } = useApp();
    const [step, setStep] = useState<'mobile' | 'otp' | 'profile'>('mobile');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [verifiedUser, setVerifiedUser] = useState<any>(null);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const startTimer = () => setTimer(30);

    const handleMobileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            if (navigator.vibrate) navigator.vibrate(30); // Error vibration
            return;
        }
        setError('');
        if (navigator.vibrate) navigator.vibrate(10);
        setIsLoading(true);

        // Optimistic Transition: Jump to OTP screen instantly for Zomato-like speed
        setStep('otp');
        startTimer();

        try {
            const response = await auth.sendOTP(mobile);
            if (response?.success !== false) {
                if (response?.otp) {
                    // Show OTP prominently on screen (fallback mode)
                    notify(`🔑 Your OTP: ${response.otp}`, 'info');
                } else {
                    notify(`✅ OTP sent to +91 ${mobile}`, 'success');
                }
            } else {
                // Revert if failed
                setStep('mobile');
                setError(response?.message || 'Failed to send OTP. Please try again.');
            }
        } catch (err: any) {
            console.error("OTP Send Error:", err);
            // Revert if error
            setStep('mobile');
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter 6-digit code');
            if (navigator.vibrate) navigator.vibrate(30); // Error vibration
            return;
        }
        setError('');
        if (navigator.vibrate) navigator.vibrate(10);
        setIsLoading(true);

        try {
            const data = await auth.verifyOTP(mobile, otp);
            if (data.success) {
                // Determine existingUser: from backend auth return OR fetch via DB
                let existingUser = data.user;
                if (!existingUser || !existingUser.name) {
                    try {
                        const dbUser = await db.getUserByPhone(mobile);
                        if (dbUser) {
                            existingUser = dbUser;
                        }
                    } catch (dbErr) {
                        console.error("DB check error:", dbErr);
                    }
                }
                
                setVerifiedUser(existingUser);

                if (existingUser && existingUser.name) {
                    // Returning user
                    await login(existingUser);
                    notify(`Welcome back, ${existingUser.name}!`, 'success');
                    if (authSuccessCallback) {
                        authSuccessCallback();
                        setAuthSuccessCallback(null);
                    }
                    onClose();
                } else {
                    // New user or missing profile
                    setStep('profile');
                }
            } else {
                setError('Invalid OTP');
            }
        } catch (err: any) {
            console.error("OTP Verify Error:", err);
            setError(err.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setError('Please enter your name');
            if (navigator.vibrate) navigator.vibrate(30); // Error vibration
            return;
        }
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]); // Success pattern for registration
        setIsLoading(true);
        try {
            // Use existing ID if found during verification, else generate one
            const userId = verifiedUser?.id || 'user_' + mobile;
            const newUser = { id: userId, name: name.trim(), mobile, role: 'customer' };
            const savedUser = await db.updateProfile(userId, newUser);
            await login(savedUser);

            notify(`Welcome to Galimandi, ${name}! 📍 Sharing location...`, 'success');
            if (authSuccessCallback) {
                authSuccessCallback();
                setAuthSuccessCallback(null);
            }
            onClose();

            // 📍 Auto-request location for NEW user right after name is saved
            // Small delay so the modal closes first and the browser prompt feels natural
            setTimeout(() => {
                requestLocationSilently(setUserLocation);
            }, 800);
        } catch (err: any) {
            console.error("Profile Setup Error:", err);
            setError(err.message || 'Profile setup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        {step !== 'mobile' && (
                            <button
                                onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(5);
                                    setStep('mobile');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                            >
                                <ArrowLeft size={20} className="text-gray-500" />
                            </button>
                        )}
                        <h2 className="text-2xl font-black text-gray-900 flex-1">
                            {step === 'mobile' ? 'Quick Login' : step === 'otp' ? 'Verify OTP' : 'Almost There!'}
                        </h2>
                        <button
                            onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(5);
                                onClose();
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-8">
                        <AnimatePresence mode="wait">
                            {step === 'mobile' && (
                                <motion.form
                                    key="mobile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleMobileSubmit}
                                    className="space-y-6"
                                >
                                    <div className="text-gray-500 text-sm font-medium">
                                        Enter your mobile number to get a verification code.
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3">
                                                <Smartphone size={16} className="text-gray-400" />
                                                <span className="text-sm font-bold text-gray-500">+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                autoFocus
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="00000 00000"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-20 pr-4 outline-none font-bold text-lg tracking-widest transition-all"
                                            />
                                        </div>
                                        {error && <div className="text-red-500 text-xs font-bold pl-2">{error}</div>}
                                    </div>
                                    <button
                                        disabled={mobile.length !== 10 || isLoading}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
                                        {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </motion.form>
                            )}

                            {step === 'otp' && (
                                <motion.form
                                    key="otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleOtpSubmit}
                                    className="space-y-6"
                                >
                                    <div className="text-gray-500 text-sm font-medium">
                                        Enter the 6-digit code sent to <span className="font-bold text-gray-900">+91 {mobile}</span>.
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-center gap-4">
                                            <input
                                                type="text"
                                                autoFocus
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="• • • • • •"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 text-center outline-none font-bold text-5xl tracking-[0.5em] transition-all placeholder:tracking-normal"
                                            />
                                        </div>
                                        {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
                                    </div>
                                    <button
                                        disabled={otp.length !== 6 || isLoading}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Continue'}
                                    </button>

                                    <div className="text-center">
                                        {timer > 0 ? (
                                            <p className="text-sm font-bold text-gray-400">
                                                Resend OTP in <span className="text-gray-900">{timer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (navigator.vibrate) navigator.vibrate(15);
                                                    handleMobileSubmit(new Event('submit') as any);
                                                }}
                                                className="text-sm font-black text-primary hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </motion.form>
                            )}

                            {step === 'profile' && (
                                <motion.form
                                    key="profile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleProfileSubmit}
                                    className="space-y-6"
                                >
                                    <div className="text-gray-500 text-sm font-medium">
                                        Almost there! We just need your name to complete registration.
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                autoFocus
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your Full Name"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold transition-all"
                                            />
                                        </div>
                                        {error && <div className="text-red-500 text-xs font-bold pl-2">{error}</div>}
                                    </div>
                                    <button
                                        disabled={name.trim().length < 2 || isLoading}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Start Shopping'}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            Secured by Galimandi Cloud Auth
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
