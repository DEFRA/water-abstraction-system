'use strict'

class NoBillingPeriodsError extends Error {
  constructor(year = null) {
    super(
      "No billing periods could be determined. Perhaps you are trying to create a supplementary in an environment where the last annual doesn't exist or was in a PRESROC year."
    )

    this.year = year
  }
}

module.exports = NoBillingPeriodsError
