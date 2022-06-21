import * as Witnet from "witnet-requests"

// Retrieve ANT/ETH-6 price from Bittrex
const bittrex = new Witnet.Source("https://api.bittrex.com/v3/markets/ANT-ETH/ticker")
  .parseJSONMap()
  .getFloat("lastTradeRate")
  .multiply(10 ** 6)
  .round()

// Retrieves ANT/ETH price from the HUOBI API
const huobi = new Witnet.Source("https://api.huobi.pro/market/detail/merged?symbol=anteth")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getMap("tick") // Access to the `Map` object at index 0
  .getFloat("close") // Get the `String` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieve ANT/ETH-6 price from Kraken
const kraken = new Witnet.Source("https://api.kraken.com/0/public/Ticker?pair=ANTETH")
  .parseJSONMap()
  .getMap("result")
  .getMap("ANTETH")
  .getArray("a")
  .getFloat(0)
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
  .addSource(bittrex)
  .addSource(huobi)
  .addSource(kraken)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }