import * as Witnet from "witnet-requests"

// Retrieve MASK/USDT-6 price from the Binance HTTP-GET API
const binance = new Witnet.Source("https://api.binance.us/api/v3/ticker/price?symbol=MASKUSDT")
  .parseJSONMap()
  .getFloat("price")
  .multiply(10 ** 6)
  .round()

// Retrieves USDT price of MASK from the OkEx API (derived from USDT/USD exchange rate)
const okex = new Witnet.Source("https://www.okex.com/api/index/v3/MASK-USDT/constituents")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("data") // Access to the `Map` object at `data` key
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves MASK/USDT-6 from the Hoo HTTP-GET API
    const hoo = new Witnet.Source("https://api.hoolgd.com/open/v1/tickers/market")
      .parseJSONMap() // Parse a `Map` from the retrieved `String`
      .getArray("data") // Access to the `Map` object at `data` key
      .filter( 
        // From all elements in the map,
        // select the one which "symbol" field
        // matches "MASK-USDT":
        new Witnet.Script([ Witnet.TYPES.MAP ])
          .getString("symbol")
          .match({ "MASK-USDT": true }, false)
      )
      .getMap(0) // Get first (and only) element from the resulting Map
      .getFloat("price") // Get the `Float` value associated to the `price` key
      .multiply(10 ** 6) // Use 6 digit precision
      .round() // Cast to integer

// Retrieves USDT price of MASK from the Gate.io API
const gateio = new Witnet.Source("https://data.gateapi.io/api2/1/ticker/mask_usdt")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves MASK/USDT price from the HUOBI API
const huobi = new Witnet.Source("https://api.huobi.pro/market/detail/merged?symbol=maskusdt")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("tick") // Access to the `Map` object at index 0
  .getFloat("close") // Get the `String` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves MASK/USDT-6 from KUCOIN API
const kucoin = new Witnet.Source("https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=MASK-USDT")
  .parseJSONMap() 
  .getMap("data")
  .getFloat("price")
  .multiply(10 ** 6)
  .round()

// Retrieve MASK/USDT-6 price from Coinbase
const coinbase = new Witnet.Source("https://api.coinbase.com/v2/exchange-rates?currency=USDT")
  .parseJSONMap()
  .getMap("data")
  .getMap("rates")
  .getFloat("MASK")
  .power(-1)
  .multiply(10 ** 6)
  .round()

// Retrieves USDT price of MASK from the HOTBIT API
const hotbit = new Witnet.Source("https://api.hotbit.io/api/v1/market.last?market=MASKUSDT")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getFloat("result") // Get the `Float` value associated to the `result` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer


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
  .addSource(binance)
  .addSource(okex)
  .addSource(hoo)
  .addSource(gateio)
  .addSource(huobi)
  .addSource(kucoin)
  .addSource(coinbase)
  .addSource(hotbit)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }