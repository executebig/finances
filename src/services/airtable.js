const config = require('@config')
const clog = require('@services/clog')

const AirtablePlus = require('airtable-plus')
const _ = require('lodash')
const TX_TABLE = 'Transactions'

let DATA_CACHE = {}

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

const DATE_SORT = [
  {
    field: 'Tx Date',
    direction: 'desc'
  }
]

const getTx = async (opt = {}) => {
  const hash = hashify(JSON.stringify(opt))

  if (!DATA_CACHE[hash]) {
    // Pull data (# rows or all) from Airtable
    console.log(`Asking airtable for #${hash}...`)
    const d = await airtable.read({
      maxRecords: opt.rows ? opt.rows : -1,
      sort: DATE_SORT
    })
    DATA_CACHE[hash] = d

    return d
  } else {
    console.log(`Found #${hash} in local cache...`)
    return DATA_CACHE[hash]
  }
}

const createTx = async (txs) => {
  await airtable.create(txs, { complex: true })
  clearCache()
}

const findTx = async (tx) => {
  console.log('Lookup ' + tx.id)

  const uuid = tx.id
  const row = await airtable.read({
    filterByFormula: `{Tx UUID} = "${uuid}"`,
    sort: DATE_SORT,
    maxRecords: 1
  })

  if (row[0]) {
    clog.log(
      `Transaction ${tx.id} exists. No action taken.`
    )
  } else if (tx.status === 'failed') {
    clog.log(`Transaction ${tx.id} failed. Skipping...`)
    return true // override for failed transactions
  } else {
    clog.log(
      `Found new transaction ${tx.id}. New entry merged.`,
      'success'
    )
  }

  return row[0] ? row[0] : null
}

const findTxById = async (id) => {
  let row = await airtable.find(id)
  row.fields.id = row.id
  row.fields.hash = hashify(row.id)
  row.fields['Redacted'] = Boolean(row.fields['Redacted'])
  row = row.fields

  return row
}

const clearCache = () => {
  DATA_CACHE = {}
  clog.log(`Cache cleared!`, 'success')
}

const updateTx = async (id, ptx) => {
  console.log(ptx)
  return await airtable.update(id, ptx, {
    complex: true
  }).catch(e => {
    console.log(e)
  })
}

module.exports = {
  getTx,
  createTx,
  findTx,
  findTxById,
  clearCache,
  updateTx
}
