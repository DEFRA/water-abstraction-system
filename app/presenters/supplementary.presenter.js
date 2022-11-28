'use strict'

/**
 * Formats responses from the `SupplementaryService`
 * @module SupplementaryPresenter
 */

class SupplementaryPresenter {
  constructor (data) {
    this._data = data
  }

  go () {
    return this._presentation(this._data)
  }

  _presentation (data) {
    const licences = data.licences.map((licence) => {
      return {
        licenceId: licence.licenceId,
        licenceRef: licence.licenceRef
      }
    })
    const chargeVersions = data.chargeVersions.map((chargeVersion) => {
      return {
        chargeVersionId: chargeVersion.chargeVersionId,
        licenceRef: chargeVersion.licenceRef,
        licenceId: chargeVersion.licenceId,
        scheme: chargeVersion.scheme,
        endDate: chargeVersion.endDate
      }
    })

    return {
      billingPeriods: data.billingPeriods,
      licences,
      chargeVersions
    }
  }
}

module.exports = SupplementaryPresenter
