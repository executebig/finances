const config = require('@config')
const clog = require('@services/clog')

const AirtablePlus = require('airtable-plus')
const TX_TABLE = "Transactions"

const airtable = new AirtablePlus({
  baseID: config.airtable.base,
  apiKey: config.airtable.key,
  tableName: TX_TABLE,
  camelCase: true,
  transform: (r) => {
    delete r.fields.txRawName
    delete r.fields.accountId
    delete r.fields.mercuryLink
    delete r.fields.txUuid

    r.fields.id = r.id

    if (r.fields.redacted) {
      r.fields.txDisplayName = "——"
    }

    return r.fields
  }
})

const DATE_SORT = [{
  field: 'Tx Date',
  direction: 'desc'
}]

const getTx = async (rows) => {
  // Pull data (# rows or all) from Airtable
  const d = await airtable.read(rows ? { maxRecords: rows, sort: DATE_SORT } : { sort: DATE_SORT })
  return d
}

const createTx = async (txs) => {
  console.log(txs)
  await airtable.create(txs, { complex: true })
}

const findTx = async (tx) => {
  console.log("Lookup " + tx.id)

  const uuid = tx.id
  const row = await airtable.read({ filterByFormula: `{Tx UUID} = "${uuid}"`, sort: DATE_SORT, maxRecords: 1 })

  if (row[0]) {
    clog.log(`Transaction ${tx.id} exists. No action taken.`)
  } else {
    clog.log(`Found new transaction ${tx.id}. New entry merged.`, "success")
  }

  return row[0] ? row[0] : null
}

module.exports = { getTx, createTx, findTx }