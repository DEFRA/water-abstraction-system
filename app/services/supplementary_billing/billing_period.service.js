'use strict'

/**
 * @module BillingPeriodService
 *
 */

class BillingPeriodService {
  static go () {
    const currentDate = this._currentDate()
    const startDay = 1
    const startMonth = 4
    const endDay = 31
    const endMonth = 3

    let startYear
    let endYear

    // getMonth returns an integer (0-11). So that January is represented as 0 and December as 11, hence the  +1.
    if (currentDate.getMonth() + 1 <= endMonth) {
      startYear = currentDate.getFullYear() - 1
      endYear = currentDate.getFullYear()
    } else {
      startYear = currentDate.getFullYear()
      endYear = currentDate.getFullYear() + 1
    }

    return [{
      startDate: `${startYear}-${'0' + startMonth}-${'0' + startDay}`,
      endDate: `${endYear}-${'0' + endMonth}-${endDay}`
    }]
  }

  static _currentDate () {
    return new Date()
  }
}

module.exports = BillingPeriodService
