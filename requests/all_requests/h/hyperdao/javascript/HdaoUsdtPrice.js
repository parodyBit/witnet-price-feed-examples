import * as Witnet from "witnet-requests"

// Retrieves USDT price of HDAO from the OkEx API (derived from USDT/USD exchange rate)
const okex = new Witnet.Source("https://www.okex.com/api/index/v3/HDAO-USDT/constituents")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("data") // Access to the `Map` object at `data` key
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves HDAO/USDT-6 from the Hoo HTTP-GET API
    const hoo = new Witnet.Source("https://api.hoolgd.com/open/v1/tickers/market")
      .parseJSONMap() // Parse a `Map` from the retrieved `String`
      .getArray("data") // Access to the `Map` object at `data` key
      .filter( 
        // From all elements in the map,
        // select the one which "symbol" field
        // matches "HDAO-USDT":
        new Witnet.Script([ Witnet.TYPES.MAP ])
          .getString("symbol")
          .match({ "HDAO-USDT": true }, false)
      )
      .getMap(0) // Get first (and only) element from the resulting Map
      .getFloat("price") // Get the `Float` value associated to the `price` key
      .multiply(10 ** 6) // Use 6 digit precision
      .round() // Cast to integer

// Retrieve HDAO/USDT-6 price from Bittrex
const bittrex = new Witnet.Source("https://api.bittrex.com/v3/markets/HDAO-USDT/ticker")
  .parseJSONMap()
  .getFloat("lastTradeRate")
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
  .addSource(okex)
  .addSource(hoo)
  .addSource(bittrex)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }