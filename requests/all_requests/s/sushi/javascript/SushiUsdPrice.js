import * as Witnet from "witnet-requests"

// Retrieve SUSHI/USD-6 price from Coinbase
const coinbase = new Witnet.Source("https://api.coinbase.com/v2/exchange-rates?currency=USD")
  .parseJSONMap()
  .getMap("data")
  .getMap("rates")
  .getFloat("SUSHI")
  .power(-1)
  .multiply(10 ** 6)
  .round()

// Retrieve SUSHI/USD-6 price from Kraken
const kraken = new Witnet.Source("https://api.kraken.com/0/public/Ticker?pair=SUSHIUSD")
  .parseJSONMap()
  .getMap("result")
  .getMap("SUSHIUSD")
  .getArray("a")
  .getFloat(0)
  .multiply(10 ** 6)
  .round()

// Retrieves USD price of SUSHI from the Gate.io API
const gateio = new Witnet.Source("https://data.gateapi.io/api2/1/ticker/sushi_usd")
  .parseJSONMap() // Parse a `Map` from the retrieved `String`
  .getFloat("last") // Get the `Float` value associated to the `last` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Retrieve SUSHI/usd price from BitStamp
const bitstamp = new Witnet.Source("https://www.bitstamp.net/api/v2/ticker/sushiusd")
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
  .addSource(coinbase)
  .addSource(kraken)
  .addSource(gateio)
  .addSource(bitstamp)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }