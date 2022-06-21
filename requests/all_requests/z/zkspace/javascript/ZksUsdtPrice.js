import * as Witnet from "witnet-requests"

// Retrieves USDT price of ZKS from the Gate.io API
const gateio = new Witnet.Source("https://data.gateapi.io/api2/1/ticker/zks_usdt")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves ZKS/USDT-6 from the Hoo HTTP-GET API
    const hoo = new Witnet.Source("https://api.hoolgd.com/open/v1/tickers/market")
      .parseJSONMap() // Parse a `Map` from the retrieved `String`
      .getArray("data") // Access to the `Map` object at `data` key
      .filter( 
        // From all elements in the map,
        // select the one which "symbol" field
        // matches "ZKS-USDT":
        new Witnet.Script([ Witnet.TYPES.MAP ])
          .getString("symbol")
          .match({ "ZKS-USDT": true }, false)
      )
      .getMap(0) // Get first (and only) element from the resulting Map
      .getFloat("price") // Get the `Float` value associated to the `price` key
      .multiply(10 ** 6) // Use 6 digit precision
      .round() // Cast to integer

// Retrieves USDT price of ZKS from the OkEx API (derived from USDT/USD exchange rate)
const okex = new Witnet.Source("https://www.okex.com/api/index/v3/ZKS-USDT/constituents")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("data") // Access to the `Map` object at `data` key
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves USDT price of ZKS from the HOTBIT API
const hotbit = new Witnet.Source("https://api.hotbit.io/api/v1/market.last?market=ZKSUSDT")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getFloat("result") // Get the `Float` value associated to the `result` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieves ZKS/USDT price from the HUOBI API
const huobi = new Witnet.Source("https://api.huobi.pro/market/detail/merged?symbol=zksusdt")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("tick") // Access to the `Map` object at index 0
  .getFloat("close") // Get the `String` value associated to the `last` key
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
  .addSource(gateio)
  .addSource(hoo)
  .addSource(okex)
  .addSource(hotbit)
  .addSource(huobi)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }