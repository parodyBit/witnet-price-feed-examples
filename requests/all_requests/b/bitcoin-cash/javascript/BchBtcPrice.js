import * as Witnet from "witnet-requests"

// Retrieves BCH/BTC-6 price from the Bitmax API
const ascendex = new Witnet.Source("https://ascendex.com/api/pro/v1/spot/ticker?symbol=CRO/USDT")
  .parseJSONMap()
  .getMap("data")
  .getFloat("close")
  .multiply(10 ** 6)
  .round()

// Retrieve BCH/BTC-6 price from the Binance HTTP-GET API
const binance = new Witnet.Source("https://api.binance.us/api/v3/ticker/price?symbol=BCHBTC")
  .parseJSONMap()
  .getFloat("price")
  .multiply(10 ** 6)
  .round()

// Retrieve BCH/BTC-6 price from Coinbase
const coinbase = new Witnet.Source("https://api.coinbase.com/v2/exchange-rates?currency=BTC")
  .parseJSONMap()
  .getMap("data")
  .getMap("rates")
  .getFloat("BCH")
  .power(-1)
  .multiply(10 ** 6)
  .round()

// Retrieves BCH/BTC price from the HUOBI API
const huobi = new Witnet.Source("https://api.huobi.pro/market/detail/merged?symbol=bchbtc")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("tick") // Access to the `Map` object at index 0
  .getFloat("close") // Get the `String` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves BTC price of BCH from the OkEx API (derived from USDT/USD exchange rate)
const okex = new Witnet.Source("https://www.okex.com/api/index/v3/BCH-BTC/constituents")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("data") // Access to the `Map` object at `data` key
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves BCH/BTC-6 from KUCOIN API
const kucoin = new Witnet.Source("https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BCH-BTC")
  .parseJSONMap() 
  .getMap("data")
  .getFloat("price")
  .multiply(10 ** 6)
  .round()

// Retrieves BTC price of BCH from the HOTBIT API
const hotbit = new Witnet.Source("https://api.hotbit.io/api/v1/market.last?market=BCHBTC")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getFloat("result") // Get the `Float` value associated to the `result` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieve BCH/btc price from BitStamp
const bitstamp = new Witnet.Source("https://www.bitstamp.net/api/v2/ticker/bchbtc")
  .parseJSONMap()
  .getFloat("last")
  .multiply(10 ** 6)
  .round()


// Filters out any value that is more than 1.5 times the standard
// deviation away from the average, then computes the average mean of the
// values that pass the filter.
const aggregator = new Witnet.Aggregator({
  filters: [
    [Witnet.Types.FILTERS.deviationStandard, 1.5],
  ],
  reducer: Witnet.Types.REDUCERS.averageMean,
})

// Filters out any value that is more than 1.5 times the standard
// deviation away from the average, then computes the average mean of the
// values that pass the filter.
const tally = new Witnet.Tally({
  filters: [
    [Witnet.Types.FILTERS.deviationStandard, 1.5],
  ],
  reducer: Witnet.Types.REDUCERS.averageMean,
})

// This is the Witnet.Request object that needs to be exported
const request = new Witnet.Request()
  .addSource(ascendex)
  .addSource(binance)
  .addSource(coinbase)
  .addSource(huobi)
  .addSource(okex)
  .addSource(kucoin)
  .addSource(hotbit)
  .addSource(bitstamp)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }