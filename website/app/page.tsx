'use client';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ShoppingCart,
  Ticket,
  Trophy,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  Activity
} from 'lucide-react';

// --- Components for Visual Flair ---

// A glowing background blob effect
const BackgroundGlow = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[40vw] h-[40vw] bg-indigo-900/20 rounded-full blur-[100px]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
  </div>
);

// High-end glass card component
const GlassCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
    {children}
  </motion.div>
);

export default function Home() {
  const [jackpot, setJackpot] = useState('0.0000');
  const [timeLeft, setTimeLeft] = useState('59:59');

  // Logic remains untouched
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const minutes = 59 - now.getMinutes() % 60;
      const seconds = 59 - now.getSeconds();
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#03040B] text-white font-sans selection:bg-blue-500/30">
      {/* Import Premium Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@300;500;700&display=swap');
        
        body { font-family: 'Outfit', sans-serif; }
        h1, h2, h3, .font-display { font-family: 'Space Grotesk', sans-serif; }
        
        .text-glow { text-shadow: 0 0 40px rgba(59, 130, 246, 0.5); }
        .text-glow-gold { text-shadow: 0 0 40px rgba(234, 179, 8, 0.3); }
      `}</style>

      <BackgroundGlow />

      {/* --- Header --- */}
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#03040B]/70 backdrop-blur-2xl">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="absolute -inset-1 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white group-hover:text-blue-200 transition-colors">
              JACKSPOT<span className="text-blue-500">.xyz</span>
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-4">
             {/* Note: ConnectButton styling is controlled by RainbowKit theme, but we wrap it for layout */}
             <div className="hover:scale-105 transition-transform duration-200">
               <ConnectButton />
             </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24 relative"
        >
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent blur-[80px] rounded-full pointer-events-none" />

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-blue-300">Live Jackpot</span>
          </motion.div>

          <h2 className="text-lg md:text-xl text-blue-200/80 mb-2 font-light tracking-wide">CURRENT PRIZE POOL</h2>
          
          <div className="relative inline-block group">
            <motion.div
              className="text-7xl md:text-9xl font-black font-display tracking-tighter mb-4"
              animate={{ textShadow: ["0 0 20px rgba(250,204,21,0.1)", "0 0 40px rgba(250,204,21,0.3)", "0 0 20px rgba(250,204,21,0.1)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {jackpot} <span className="text-4xl md:text-6xl text-yellow-500/50 align-top mt-4 inline-block">ETH</span>
              </span>
            </motion.div>
            
            {/* Value Bubble */}
            <div className="absolute -right-12 -top-4 rotate-12 bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-sm text-yellow-200/80 shadow-xl hidden md:block">
              ≈ $0.00 USD
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-24">
          
          {/* Countdown Timer (Double Width) */}
          <GlassCard className="lg:col-span-2 p-8 flex flex-col justify-between group" delay={0.2}>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-blue-100 font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Next Draw
                </h3>
                <p className="text-sm text-slate-400 mt-1">Round closes shortly</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="relative">
              <div className="text-6xl md:text-7xl font-mono font-bold tracking-tight text-white tabular-nums">
                {timeLeft}
              </div>
              <div className="absolute bottom-2 right-0 text-xs font-mono text-blue-500/50">HRS : MINS</div>
            </div>
          </GlassCard>

          {/* User Tickets */}
          <GlassCard className="p-8 group" delay={0.3}>
            <div className="flex items-start justify-between mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/20 group-hover:rotate-12 transition-transform">
                <Ticket className="w-5 h-5 text-purple-300" />
              </div>
              <div className="px-2 py-1 rounded bg-purple-500/10 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Entry
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <p className="text-sm text-purple-200/60">Connect wallet to view tickets</p>
          </GlassCard>

          {/* Win Chance */}
          <GlassCard className="p-8 group relative" delay={0.4}>
             <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-8">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/20 group-hover:rotate-12 transition-transform">
                <TrendingUp className="w-5 h-5 text-green-300" />
              </div>
              <div className="px-2 py-1 rounded bg-green-500/10 text-[10px] font-bold text-green-300 uppercase tracking-wider">
                Odds
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">--%</div>
            <p className="text-sm text-green-200/60">Calculated live</p>
          </GlassCard>
        </div>

        {/* How to Play - Floating Steps */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/50" />
            <h3 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">HOW IT WORKS</h3>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Wallet, title: 'Connect', desc: 'Link Web3 Wallet', color: 'bg-blue-500' },
              { icon: ShoppingCart, title: 'Purchase', desc: 'Buy on Uniswap', color: 'bg-indigo-500' },
              { icon: Ticket, title: 'Auto-Enter', desc: 'Hold to play', color: 'bg-purple-500' },
              { icon: Trophy, title: 'Win Prizes', desc: 'Automatic Airdrop', color: 'bg-yellow-500' }
            ].map((step, i) => (
              <GlassCard key={i} className="p-6 text-center hover:bg-white/[0.05] transition-colors" delay={0.5 + i * 0.1}>
                <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl ${step.color} bg-opacity-10 flex items-center justify-center border border-white/10 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-[2px] bg-white/10 translate-y-[-50%]" />
                )}
              </GlassCard>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex justify-center mb-24 relative z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-10 py-5 bg-blue-600 rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-100 group-hover:opacity-90 transition-opacity" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <span className="relative z-10 flex items-center gap-3 text-xl font-bold text-white">
              Buy LOTTO Token
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>

        {/* Recent Winners (Hollow Glass Design) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="font-bold text-lg">Recent Victories</h3>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
            
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                 <Star className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="text-slate-300 font-medium mb-1">No winners this round yet</h4>
              <p className="text-sm text-slate-500">The next jackpot could be yours.</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-white/[0.05] bg-[#020205] relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
             <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center border border-blue-500/10">
                <Zap className="w-5 h-5 text-blue-500" />
             </div>
             <div>
               <p className="text-slate-400 font-medium mb-1">Secured by Base Chain</p>
               <p className="text-xs text-slate-600 uppercase tracking-widest">5% Fee Allocates to Pot</p>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}