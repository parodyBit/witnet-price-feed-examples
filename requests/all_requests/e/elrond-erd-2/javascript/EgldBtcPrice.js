import * as Witnet from "witnet-requests"

// Retrieve EGLD/BTC-6 price from the Binance HTTP-GET API
const binance = new Witnet.Source("https://api.binance.us/api/v3/ticker/price?symbol=EGLDBTC")
  .parseJSONMap()
  .getFloat("price")
  .multiply(10 ** 6)
  .round()

// Retrieves BTC price of EGLD from the OkEx API (derived from USDT/USD exchange rate)
const okex = new Witnet.Source("https://www.okex.com/api/index/v3/EGLD-BTC/constituents")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("data") // Access to the `Map` object at `data` key
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves EGLD/BTC-6 from KUCOIN API
const kucoin = new Witnet.Source("https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=EGLD-BTC")
  .parseJSONMap() 
  .getMap("data")
  .getFloat("price")
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
  .addSource(binance)
  .addSource(okex)
  .addSource(kucoin)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }