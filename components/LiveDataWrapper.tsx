import { Separator } from '@/components/ui/separator';
import CandlestickChart from '@/components/CandlestickChart';
import DataTable from '@/components/DataTable';
import { formatCurrency, getPriceChangeData } from '@/lib/utils';
import CoinHeader from '@/components/CoinHeader';

const LiveDataWrapper = async ({
  coinId,
  coin,
  coinOHLCData,
}: LiveDataProps) => {
  const priceChangeColumns: DataTableColumn<PriceChange>[] = [
    {
      header: 'Period',
      cellClassName: 'price-cell',
      cell: (row) => row.period,
    },
    {
      header: 'Change',
      cellClassName: 'amount-cell',
      cell: (row) =>
        row.changeUsd !== undefined ? formatCurrency(row.changeUsd) : '-',
    },
    {
      header: '%',
      cellClassName: 'value-cell',
      cell: (row) =>
        row.changePercent !== undefined
          ? `${row.changePercent.toFixed(2)}%`
          : '-',
    },
    {
      header: 'Up / Down',
      cellClassName: 'type-cell',
      cell: (row) => (
        <span className={row.kind === 'up' ? 'text-green-500' : 'text-red-500'}>
          {row.kind === 'up' ? 'Up' : 'Down'}
        </span>
      ),
    },
  ];

  return (
    <section id="live-data-wrapper">
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        price={coin.market_data.current_price.usd}
        priceChangePercentage24h={
          coin.market_data.price_change_percentage_24h_in_currency.usd
        }
        priceChangePercentage30d={
          coin.market_data.price_change_percentage_30d_in_currency.usd
        }
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />
      <Separator className="divider" />

      <div className="trend">
        <CandlestickChart coinId={coinId} data={coinOHLCData}>
          <h4>Trend Overview</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />

      {priceChangeColumns && (
        <div className="trades">
          <h4>Price Changes</h4>

          <DataTable
            columns={priceChangeColumns}
            data={getPriceChangeData(coin)}
            rowKey={(_, index) => index}
            tableClassName="trades-table"
          />
        </div>
      )}
    </section>
  );
};
export default LiveDataWrapper;
