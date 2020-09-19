const config = require('@config')

const AirtablePlus = require('airtable-plus')
const TX_TABLE = "Transactions"

const airtable = new AirtablePlus({
  baseID: config.airtable.base,
  apiKey:  config.airtable.key,
  tableName: TX_TABLE,
  camelCase: true
})

const DATE_SORT = [{
  field: 'Tx Date',
  direction: 'desc'
}]

const getTx = async (rows) => {
  // Pull data (# rows or all) from Airtable
  const d = await airtable.read(rows ? { maxRecords: rows,  sort: DATE_SORT } : null)
  return d
}

const createTx = async (txs) => {
  console.log(txs)
  await airtable.create(txs, {complex: true})
}

const findTx = async (tx) => {
  console.log("Lookup " + tx.id)

  const uuid = tx.id
  const row = await airtable.read({ filterByFormula: `{Tx UUID} = "${uuid}"`, sort: DATE_SORT, maxRecords: 1 })

  console.log(row[0] ? "Found record " + tx.id : "Not found record " + tx.id)

  return row[0] ? row[0] : null
}

module.exports = { getTx, createTx, findTx }