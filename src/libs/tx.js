/**
 * Tx processes the transaction table
 */

/**
 * Returns the total balance of a transaction table
 * @param {Array} txs Transaction table
 */
const sum = (txs) => {
    let sum = 0
    for (let i in txs) {
        sum += parseFloat(txs[i].txAmount)
    }
    return sum
}

/**
 * Returns the total amount of donation received in the current month
 * @param {Array} txs Transaction table
 */
const curMonthRev = (txs) => {
    let sum = 0

    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1

    for (let i in txs) {

        if (txs[i].category === "Donation") {
            const txDate = txs[i].txDate.split("-")
            const txYear = Number(txDate[0])
            const txMonth = Number(txDate[1])

            if (txYear === year && txMonth === month) {
                sum += parseFloat(txs[i].txAmount)
            }
        }
    }

    return sum
}

/**
 * Returns the total amount of funds spent this month
 * @param {Array} txs Transaction table
 */
const curMonthExp = (txs) => {
    let sum = 0

    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1

    for (let i in txs) {
        const txDate = txs[i].txDate.split("-")
        const txYear = Number(txDate[0])
        const txMonth = Number(txDate[1])

        if (txYear === year && txMonth === month) {
            if (txs[i] < 0 && txs[i].category !== "Internal Transfer") {
                sum += parseFloat(txs[i].txAmount)
            }
        }
    }

    return sum
}

module.exports = { sum, curMonthRev, curMonthExp }
