/**
 * Exchange logos and colors composable
 * Provides consistent exchange branding across the application
 */
export const useExchangeLogos = () => {
  const exchangeInfo = {
    coinbaseadvanced: {
      name: 'Coinbase Advanced',
      logo: 'https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo.svg',
      color: '#0052FF',
      bgColor: 'bg-blue-500'
    },
    kraken: {
      name: 'Kraken',
      logo: 'https://altcoinsbox.com/wp-content/uploads/2023/01/kraken-logo.svg',
      color: '#5741D9',
      bgColor: 'bg-purple-500'
    },
    bitrue: {
      name: 'Bitrue',
      logo: 'https://altcoinsbox.com/wp-content/uploads/2022/12/bitrue-logo.svg',
      color: '#FF6B00',
      bgColor: 'bg-orange-500'
    },
    lcx: {
      name: 'LCX',
      logo: 'https://assets.coingecko.com/coins/images/9985/small/zRPSu_0o_400x400.jpg',
      color: '#0066CC',
      bgColor: 'bg-blue-600'
    },
    probit: {
      name: 'ProBit',
      logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1053.png',
      color: '#1A73E8',
      bgColor: 'bg-blue-700'
    }
  };

  const getExchangeInfo = (exchangeName) => {
    const normalized = exchangeName?.toLowerCase();
    return exchangeInfo[normalized] || {
      name: exchangeName,
      logo: '',
      color: '#6B7280',
      bgColor: 'bg-gray-500'
    };
  };

  const getExchangeLogo = (exchangeName) => {
    return getExchangeInfo(exchangeName).logo;
  };

  const getExchangeColor = (exchangeName) => {
    return getExchangeInfo(exchangeName).color;
  };

  const getExchangeBgColor = (exchangeName) => {
    return getExchangeInfo(exchangeName).bgColor;
  };

  return {
    exchangeInfo,
    getExchangeInfo,
    getExchangeLogo,
    getExchangeColor,
    getExchangeBgColor
  };
};
