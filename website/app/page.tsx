'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ShoppingCart,
  Ticket,
  Trophy,
  Clock,
  TrendingUp,
  ArrowRight,
  Search,
  Zap,
  ShieldCheck,
  Sun,
  Moon,
  Star,
} from 'lucide-react';
import { useJackpotBalance, useDrawTimer, useUserStats } from '@/lib/hooks/useContractData';
import { openUniswapBuy } from '@/lib/uniswap';
import { isAddress } from 'viem';

// Baseball Icon Component
const BaseballIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="white" stroke="#E31837" strokeWidth="2"/>
    <path d="M20 30 Q35 50 20 70" stroke="#E31837" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M80 30 Q65 50 80 70" stroke="#E31837" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {[25, 30, 28, 24].map((x, i) => (
      <circle key={`l-${i}`} cx={x} cy={35 + i * 10} r="2" fill="#E31837"/>
    ))}
    {[75, 70, 72, 76].map((x, i) => (
      <circle key={`r-${i}`} cx={x} cy={35 + i * 10} r="2" fill="#E31837"/>
    ))}
  </svg>
);

// Stadium Background
const StadiumBackground = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`fixed inset-0 overflow-hidden pointer-events-none -z-10 ${isDarkMode ? 'bg-[#05080f]' : 'bg-slate-50'}`}>
    <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-green-900/10 to-transparent opacity-50" />
    <div className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-screen ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
    <div className={`absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-screen ${isDarkMode ? 'bg-[#E31837]/10' : 'bg-[#E31837]/10'}`} />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150"></div>
  </div>
);

// Jumbotron Card
const JumbotronCard = ({ children, className = "", isDarkMode }: { children: React.ReactNode; className?: string; isDarkMode: boolean }) => (
  <div className={`relative overflow-hidden border-2 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-[#0a0f1c] border-[#1a2333]' : 'bg-white border-slate-200'} ${className}`}>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
    <div className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-white/[0.02] to-transparent' : 'bg-gradient-to-b from-black/[0.01] to-transparent'}`} />
    <div className="relative z-10">{children}</div>
  </div>
);

// Animated counter hook
const useCountAnimation = (targetValue: string, duration = 2000) => {
  const [displayValue, setDisplayValue] = useState(targetValue);

  useEffect(() => {
    const target = parseFloat(targetValue);
    if (isNaN(target)) return;

    const start = parseFloat(displayValue) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        setDisplayValue(target.toFixed(4));
        clearInterval(timer);
      } else {
        setDisplayValue(current.toFixed(4));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetValue, duration, displayValue]);

  return displayValue;
};

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [addressToCheck, setAddressToCheck] = useState<string | undefined>();

  // Blockchain data hooks
  const { data: jackpotData } = useJackpotBalance();
  const { data: timerData } = useDrawTimer();
  const { data: userStats, isLoading: userStatsLoading } = useUserStats(addressToCheck);

  // Keep previous jackpot value while loading new one (prevents "..." flickering)
  const [persistedJackpot, setPersistedJackpot] = useState('0.0000');
  useEffect(() => {
    if (jackpotData?.formatted) {
      setPersistedJackpot(jackpotData.formatted);
    }
  }, [jackpotData]);

  const animatedJackpot = useCountAnimation(persistedJackpot, 2000);

  // Calculate time left (counts down to next hour)
  const [timeLeft, setTimeLeft] = useState('59:59');
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const minutes = 59 - (now.getMinutes() % 60);
      const seconds = 59 - now.getSeconds();
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckStats = () => {
    if (!walletAddress || !isAddress(walletAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    setAddressToCheck(walletAddress);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen font-sans selection:bg-[#E31837]/30 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Chakra+Petch:wght@400;600;700&family=Space+Grotesk:wght@300;500;700&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        .font-sport { font-family: 'Chakra Petch', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <StadiumBackground isDarkMode={isDarkMode} />

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${isDarkMode ? 'border-white/[0.08] bg-[#05080f]/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BaseballIcon className="w-10 h-10" />
              <div>
                <h1 className="font-sport font-bold text-2xl tracking-wider">BASEBALL</h1>
                <p className={`text-xs uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                  Hourly Lottery • Base Chain
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Wallet Input Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Check Your Lottery Stats
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
              Paste your wallet address to see your tickets and win chance
            </p>
          </motion.div>

          <JumbotronCard isDarkMode={isDarkMode} className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Wallet className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl font-mono text-sm border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
              <button
                onClick={handleCheckStats}
                disabled={userStatsLoading}
                className="px-8 py-4 bg-[#E31837] hover:bg-[#c91530] disabled:opacity-50 disabled:cursor-not-allowed text-white font-sport font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                {userStatsLoading ? 'Loading...' : 'Check Stats'}
              </button>
            </div>
          </JumbotronCard>
        </div>

        {/* Jackpot Display */}
        <div className="max-w-6xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <JumbotronCard isDarkMode={isDarkMode} className="p-8 md:p-12 text-center mb-8">
              <h2 className={`text-sm font-bold tracking-[0.3em] uppercase mb-4 pt-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                Grand Slam Jackpot
              </h2>
              <div className="flex items-baseline justify-center gap-3 px-8 pb-4">
                <span className={`text-7xl md:text-9xl font-sport font-bold tracking-tighter ${isDarkMode ? 'text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]' : 'text-slate-900'}`}>
                  {animatedJackpot}
                </span>
                <span className="text-4xl md:text-5xl font-sport font-bold text-[#E31837]">ETH</span>
              </div>
              <div className={`w-full h-px mb-4 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
              <p className={`font-mono text-sm pb-4 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                ≈ $0.00 USD
              </p>
            </JumbotronCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timer */}
              <JumbotronCard className="p-6 group" isDarkMode={isDarkMode}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-sport text-sm uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                    Next Pitch
                  </h3>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className={`text-4xl font-sport font-bold tabular-nums group-hover:text-blue-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {timeLeft}
                </div>
                <div className={`w-full h-1 mt-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                  <div className="bg-blue-500 h-full w-3/4 animate-pulse" />
                </div>
              </JumbotronCard>

              {/* Tickets */}
              <JumbotronCard className="p-6 group" isDarkMode={isDarkMode}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-sport text-sm uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                    Your Tickets
                  </h3>
                  <Ticket className="w-5 h-5 text-[#E31837]" />
                </div>
                <div className={`text-4xl font-sport font-bold group-hover:text-[#E31837] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {userStats ? userStats.tickets : '--'}
                </div>
                <p className={`text-xs mt-4 font-mono ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                  {userStats ? 'IN PLAY' : 'ENTER ADDRESS'}
                </p>
              </JumbotronCard>

              {/* Win Chance */}
              <JumbotronCard className="p-6 group" isDarkMode={isDarkMode}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-sport text-sm uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                    Batting Avg
                  </h3>
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                </div>
                <div className={`text-4xl font-sport font-bold group-hover:text-yellow-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {userStats ? `${userStats.winChance}%` : '.000'}
                </div>
                <p className={`text-xs mt-4 font-mono ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                  WIN PROBABILITY
                </p>
              </JumbotronCard>
            </div>
          </motion.div>
        </div>

        {/* How to Play */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-8 w-1.5 bg-[#E31837] rounded-full" />
            <h3 className="text-3xl font-bold font-sport uppercase tracking-wide">The Game Plan</h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: ShoppingCart, title: "Draft Players", sub: "Buy $BASEBALL", desc: "Get tokens on Uniswap via Base Network." },
              { icon: ShieldCheck, title: "Hold the Line", sub: "Auto-Entry", desc: "Holding 10k+ tokens is your season pass." },
              { icon: Zap, title: "Play Ball", sub: "Hourly Draws", desc: "Every hour is a new inning to win." },
              { icon: Trophy, title: "Grand Slam", sub: "Automatic Payouts", desc: "ETH winnings sent directly to your wallet." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className={`relative p-6 rounded-2xl border transition-colors group ${isDarkMode ? 'border-white/10 bg-[#0c1221] hover:bg-[#11192b]' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br rounded-bl-[100px] pointer-events-none ${isDarkMode ? 'from-white/5 to-transparent' : 'from-slate-100 to-transparent'}`} />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#E31837] group-hover:text-white transition-all duration-300 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <item.icon className={`w-6 h-6 group-hover:text-white ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`} />
                </div>
                <h4 className="text-sm font-bold text-[#E31837] uppercase tracking-wider mb-1">{item.sub}</h4>
                <h3 className={`text-xl font-bold mb-3 font-sport ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mb-24 relative z-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openUniswapBuy}
className="group relative px-12 py-6 bg-[#E31837] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(227,24,55,0.4)] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <span className="relative z-10 flex items-center gap-3 text-xl font-bold font-sport uppercase tracking-wider text-white">
              Buy $BASEBALL on Uniswap
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </motion.button>
        </div>

        {/* Hall of Fame */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className={`rounded-3xl border relative overflow-hidden ${isDarkMode ? 'border-white/10 bg-[#0a0f1c]' : 'border-slate-200 bg-white shadow-xl'}`}>
            <div className={`absolute top-0 left-8 w-1 h-full border-l-2 border-dashed ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`} />
            <div className={`absolute top-0 right-8 w-1 h-full border-r-2 border-dashed ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`} />
            
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-4 pl-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className={`font-bold text-lg font-sport uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Hall of Fame
                </h3>
              </div>
              <div className="pr-4 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#E31837] animate-pulse" style={{ animationDelay: `${i * 0.2}s`}} />
                ))}
              </div>
            </div>
            
            <div className="p-16 text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border ${isDarkMode ? 'bg-[#1a2333] border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                <Star className={`w-10 h-10 ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`} />
              </div>
              <h4 className={`font-medium mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                No Home Runs Yet
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                Step up to the plate. The next jackpot could be yours.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`border-t relative z-10 py-12 ${isDarkMode ? 'border-white/[0.08] bg-[#020305]' : 'border-slate-200 bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
              <BaseballIcon className="w-8 h-8" />
              <span className={`font-sport font-bold text-lg tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                BASEBALL
              </span>
            </div>
            
            <div className={`h-px w-12 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
            
            <div>
              <p className={`font-medium mb-1 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                Built on Base Chain
              </p>
              <p className={`text-xs uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                Hourly Draws • No Wallet Connect Required
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
