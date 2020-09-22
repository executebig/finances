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
    r.fields.hash = hashify(r.id)

    return r.fields
  }
})

const hashify = (str) => {
  let hash = 5381,
    i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  return hash >>> 0
}

const DATE_SORT = [{
  field: 'Tx Date',
  direction: 'desc'
}]

const getTx = async (opt = {}) => {
  const unredact = (r) => {
    r.redacted = false
    return r
  }

  // Pull data (# rows or all) from Airtable
  const d = await airtable.read({ maxRecords: opt.rows ? opt.rows : -1, sort: DATE_SORT })
  return opt.showAll ? d.map(unredact) : d
}

const createTx = async (txs) => {
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