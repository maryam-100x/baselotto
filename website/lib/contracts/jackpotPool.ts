import { publicClient } from '../viemClient'
import { type Address } from 'viem'

export const jackpotPoolAbi = [
  {
    type: 'function',
    name: 'getCurrentJackpot',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'lastDrawTime',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'drawInterval',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'currentRound',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'WinnerSelected',
    inputs: [
      { indexed: true, name: 'round', type: 'uint256' },
      { indexed: true, name: 'winner', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
] as const

export async function getJackpotBalance(poolAddress: Address): Promise<bigint> {
  const balance = await publicClient.readContract({
    address: poolAddress,
    abi: jackpotPoolAbi,
    functionName: 'getCurrentJackpot',
  })
  return balance
}

export async function getLastDrawTime(poolAddress: Address): Promise<bigint> {
  const timestamp = await publicClient.readContract({
    address: poolAddress,
    abi: jackpotPoolAbi,
    functionName: 'lastDrawTime',
  })
  return timestamp
}

export async function getDrawInterval(poolAddress: Address): Promise<bigint> {
  const interval = await publicClient.readContract({
    address: poolAddress,
    abi: jackpotPoolAbi,
    functionName: 'drawInterval',
  })
  return interval
}
