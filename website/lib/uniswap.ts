import { CONTRACTS } from './contracts/addresses'

export function getUniswapBuyUrl(tokenAddress: string): string {
  const baseUrl = 'https://app.uniswap.org/swap'
  const params = new URLSearchParams({
    chain: 'base',
    inputCurrency: 'ETH',
    outputCurrency: tokenAddress,
  })
  return `${baseUrl}?${params.toString()}`
}

export function openUniswapBuy() {
  const url = getUniswapBuyUrl(CONTRACTS.LOTTERY_TOKEN)
  window.open(url, '_blank', 'noopener,noreferrer')
}
