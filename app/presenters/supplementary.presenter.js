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
    return {
      chargeVersions: data.chargeVersions
    }
  }
}

module.exports = SupplementaryPresenter
