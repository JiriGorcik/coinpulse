'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true }
  );

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': API_KEY,
      'Content-Type': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      `API Error: ${response.status}: ${errorBody.error || response.statusText}`
    );
  }

  return response.json();
}

async function mergeWithMarketData(
  coins: Array<{ id: string; name: string; symbol: string; thumb: string }>
): Promise<SearchCoin[]> {
  if (coins.length === 0) return [];

  const ids = coins.map((c) => c.id).join(',');
  if (!ids) return [];

  const marketData = await fetcher<MarketData[]>('/coins/markets', {
    vs_currency: 'usd',
    ids,
    per_page: coins.length,
  });

  return coins.map((coin) => {
    const marketInfo = marketData.find((m) => m.id === coin.id);
    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      thumb: coin.thumb,
      data: marketInfo
        ? {
            current_price: marketInfo.current_price,
            price_change_percentage_24h: marketInfo.price_change_percentage_24h,
          }
        : undefined,
    };
  });
}

/**
 * Search coins by query
 */
export async function searchCoins(query: string): Promise<SearchCoin[]> {
  if (!query) return [];

  const searchData = await fetcher<CoinGeckoSearchResponse>('/search', {
    query,
  });
  const coins = searchData.coins.slice(0, 10).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    thumb: c.thumb,
  }));

  return mergeWithMarketData(coins);
}

/**
 * Get trending coins
 */
export async function getTrendingCoins(): Promise<SearchCoin[]> {
  const trendingData =
    await fetcher<CoinGeckoTrendingResponse>('/search/trending');

  const coins = trendingData.coins.map((c: TrendingCoin) => ({
    id: c.item.id,
    name: c.item.name,
    symbol: c.item.symbol,
    thumb: c.item.thumb,
  }));

  return mergeWithMarketData(coins);
}
