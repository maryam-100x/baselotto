'use client'

import { useQuery } from '@tanstack/react-query'
import { formatEther, type Address, isAddress } from 'viem'
import { getJackpotBalance, getLastDrawTime } from '../contracts/jackpotPool'
import { getUserLotteryStats } from '../contracts/erc20'
import { CONTRACTS, LOTTERY_CONFIG } from '../contracts/addresses'

// Hook to get jackpot balance (refreshes every 12 seconds)
export function useJackpotBalance() {
  return useQuery({
    queryKey: ['jackpot', CONTRACTS.JACKPOT_POOL],
    queryFn: async () => {
      const balance = await getJackpotBalance(CONTRACTS.JACKPOT_POOL as Address)
      return {
        raw: balance,
        formatted: formatEther(balance),
      }
    },
    refetchInterval: 12000, // 12 seconds
    staleTime: 10000,
  })
}

// Hook to get last draw time and calculate next draw
export function useDrawTimer() {
  return useQuery({
    queryKey: ['drawTimer', CONTRACTS.JACKPOT_POOL],
    queryFn: async () => {
      const lastDraw = await getLastDrawTime(CONTRACTS.JACKPOT_POOL as Address)
      const lastDrawSeconds = Number(lastDraw)
      const nextDrawSeconds = lastDrawSeconds + (LOTTERY_CONFIG.DRAW_INTERVAL_HOURS * 3600)
      const now = Math.floor(Date.now() / 1000)
      const timeUntilDraw = Math.max(0, nextDrawSeconds - now)
      
      return {
        lastDrawTimestamp: lastDrawSeconds,
        nextDrawTimestamp: nextDrawSeconds,
        timeUntilDrawSeconds: timeUntilDraw,
      }
    },
    refetchInterval: 1000, // Update every second
    staleTime: 0,
  })
}

// Interface for user stats return type
interface UserStats {
  tickets: number;
  balance: bigint;
  decimals: number;
  formattedBalance: string;
  winChance: string;
}

// Hook to get user's lottery stats
export function useUserStats(address: string | undefined) {
  const isValidAddress = address && isAddress(address)

  return useQuery<UserStats>({
    queryKey: ['userStats', address],
    queryFn: async () => {
      if (!isValidAddress) throw new Error('Invalid address')
      
      const stats = await getUserLotteryStats(
        CONTRACTS.LOTTERY_TOKEN as Address,
        address as Address,
        LOTTERY_CONFIG.TOKENS_PER_TICKET
      )

      // Calculate total tickets in circulation (simplified)
      // In production, you'd query this from the contract
      const totalTickets = stats.tickets > 0 ? stats.tickets * 100 : 1000
      const winChance = totalTickets > 0 ? (stats.tickets / totalTickets) * 100 : 0

      return {
        tickets: stats.tickets,
        balance: stats.balance,
        decimals: stats.decimals,
        formattedBalance: formatEther(stats.balance),
        winChance: winChance.toFixed(4),
      }
    },
    enabled: !!isValidAddress,
    staleTime: 30000, // 30 seconds
  })
}
