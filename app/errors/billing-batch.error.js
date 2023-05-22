'use strict'

class BillingBatchError extends Error {
  constructor (error, code = null) {
    super(error)

    this.code = code
  }
}

module.exports = BillingBatchError
