const fetch = require('node-fetch')
const config = require('@config')
const clog = require('@services/clog')

const db = require('@services/airtable')
const MERCURY_URL = 'https://backend.mercury.com/api/v1'

const getAccounts = (id) => {
  return new Promise((resolve, reject) => {
    fetch(`${MERCURY_URL}/accounts`, {
      method: 'get',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${config.mercury.key}`,
        accept: 'application/json'
      }
    })
      .then((json) => json.json())
      .then((data) => {
        resolve(data.accounts)
      })
  })
}

// Sync specific account
const syncAccount = (id) => {
  clog.log("Requesting transaction information from Mercury...")

  const createRecords = []

  fetch(`${MERCURY_URL}/account/${id}/transactions`, {
    method: 'get',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${config.mercury.key}`,
      accept: 'application/json'
    }
  })
    .then((json) => json.json())
    .then(async (data) => {
      const promises = data.transactions.map(async (tx) => {
        return db.findTx(tx)
      })

      const results = await Promise.all(promises)

      results.forEach((v, i) => {
        if (!v) {
          tx = data.transactions[i]

          const isNegative = tx.amount < 0
          const displayString = isNegative
            ? 'PAYMENT TO ' + tx.counterpartyName
            : 'INCOMING FROM ' + tx.counterpartyName

          createRecords.push({
            fields: {
              'Tx UUID': tx.id,
              'Tx Raw Name': isNegative
                ? displayString
                : tx.bankDescription,
              'Tx Display Name': displayString, // wait for manual update
              'Tx Amount': tx.amount,
              'Tx Date': new Date(
                tx.postedAt
              ).toLocaleDateString(),
              Account: 'Mercury',
              'Account ID': id,
              'Mercury Link': tx.dashboardLink
            }
          })
        }
      })
    })
    .finally(() => {
      if (createRecords.length > 0) {
        db.createTx(createRecords).catch((e) => {
          console.log(e)
        })
      }

      clog.log(
        `Synced account ${id}. Updated ${createRecords.length} entries.`, "success"
      )
    })
}

module.exports = { getAccounts, syncAccount }
