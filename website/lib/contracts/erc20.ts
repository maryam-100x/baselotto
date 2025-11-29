import { publicClient } from '../viemClient'
import { formatUnits, type Address } from 'viem'

// Standard ERC-20 ABI (only functions we need)
export const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
] as const

export async function getTokenBalance(tokenAddress: Address, userAddress: Address) {
  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress],
  })
  return balance
}

export async function getTokenDecimals(tokenAddress: Address) {
  const decimals = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
  })
  return decimals
}

export function calculateLotteryTickets(balance: bigint, decimals: number, tokensPerTicket: number = 10_000): number {
  const balanceInTokens = Number(formatUnits(balance, decimals))
  return Math.floor(balanceInTokens / tokensPerTicket)
}

export async function getUserLotteryStats(
  tokenAddress: Address,
  userAddress: Address,
  tokensPerTicket: number = 10_000
) {
  const [balance, decimals] = await Promise.all([
    getTokenBalance(tokenAddress, userAddress),
    getTokenDecimals(tokenAddress),
  ])

  const tickets = calculateLotteryTickets(balance, decimals, tokensPerTicket)
  
  return {
    balance,
    tickets,
    decimals,
  }
}
