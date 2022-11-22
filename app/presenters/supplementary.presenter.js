'use strict'

/**
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
    const chargeVersions = data.chargeVersions.map((chargeVersion) => {
      return {
        chargeVersionId: chargeVersion.chargeVersionId,
        licenceRef: chargeVersion.licenceRef
      }
    })

    return {
      chargeVersions
    }
  }
}

module.exports = SupplementaryPresenter
