'use strict'

class BillRunError extends Error {
  constructor(error, code = null) {
    super(error)

    this.code = code
  }
}

module.exports = BillRunError
