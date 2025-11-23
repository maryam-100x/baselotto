'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [jackpot, setJackpot] = useState('0.0000');
  const [timeLeft, setTimeLeft] = useState('59:59');

  // Countdown timer
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-purple-500/30">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          🎰 LOTTO
        </h1>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:scale-105 transition-transform">
          Connect Wallet
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        
        {/* Jackpot Display */}
        <div className="text-center mb-12">
          <h2 className="text-xl text-purple-300 mb-4">CURRENT JACKPOT</h2>
          <div className="text-7xl font-bold mb-2 animate-pulse">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {jackpot} ETH
            </span>
          </div>
          <p className="text-gray-400 text-lg">≈ $0.00 USD</p>
        </div>

        {/* Countdown Timer */}
        <div className="max-w-md mx-auto mb-12 p-8 bg-black/40 rounded-2xl border border-purple-500/30 backdrop-blur">
          <div className="text-center">
            <p className="text-purple-300 mb-2">NEXT DRAW IN</p>
            <div className="text-5xl font-mono font-bold text-yellow-400">
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-black/40 rounded-xl border border-purple-500/30 backdrop-blur">
            <div className="text-purple-300 text-sm mb-1">Your Tickets</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="p-6 bg-black/40 rounded-xl border border-purple-500/30 backdrop-blur">
            <div className="text-purple-300 text-sm mb-1">Total Holders</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="p-6 bg-black/40 rounded-xl border border-purple-500/30 backdrop-blur">
            <div className="text-purple-300 text-sm mb-1">Your Odds</div>
            <div className="text-3xl font-bold">1 in 0</div>
          </div>
        </div>

        {/* How to Play */}
        <div className="max-w-4xl mx-auto mb-12 p-8 bg-black/40 rounded-2xl border border-purple-500/30 backdrop-blur">
          <h3 className="text-2xl font-bold mb-6 text-center">🎲 How to Play</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">💼</div>
              <div className="font-semibold mb-2">1. Connect Wallet</div>
              <div className="text-sm text-gray-400">Connect your Web3 wallet</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <div className="font-semibold mb-2">2. Buy LOTTO</div>
              <div className="text-sm text-gray-400">Get tokens on Uniswap</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎫</div>
              <div className="font-semibold mb-2">3. Auto Entry</div>
              <div className="text-sm text-gray-400">10,000 tokens = 1 ticket</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="font-semibold mb-2">4. Win Big</div>
              <div className="text-sm text-gray-400">Winner every hour!</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl rounded-xl hover:scale-105 transition-transform shadow-2xl">
            Buy LOTTO on Uniswap →
          </button>
        </div>

        {/* Recent Winners */}
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-black/40 rounded-2xl border border-purple-500/30 backdrop-blur">
          <h3 className="text-2xl font-bold mb-6">🎉 Recent Winners</h3>
          <div className="text-center text-gray-400 py-8">
            No winners yet. Be the first!
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 py-8 text-center text-gray-400">
        <p>Built on Base Chain • 5% Trading Fee → Jackpot</p>
      </footer>
    </div>
  );
}