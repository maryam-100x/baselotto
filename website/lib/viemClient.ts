import { createPublicClient, http, fallback } from 'viem'
import { base } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: base,
  transport: fallback([
    http('https://mainnet.base.org'),
    http('https://base.llamarpc.com'),
  ], {
    rank: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
})
