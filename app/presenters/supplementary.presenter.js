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

  /**
   * Creates an array of unique licence objects from the combined data received
   *
   * We know the main query in `SupplementaryService` is based on charge versions. As a licence may be linked to
   * multiple charge versions, it is possible that the licence ID and reference will feature multiple times in the
   * results.
   *
   * To make it easier to confirm we are including the right licences in the Supplementary bill run process we want to
   * extract a unique list of licence ID's and references.
   */
  _licences (data) {
    // Use map to generate an array of just licence IDs
    const justLicenceIds = data.chargeVersions.map((chargeVersion) => chargeVersion.licenceId)
    // Set is used to store unique values. So, if you what you pass in contains duplicates Set will return just the
    // unique ones
    const uniqueLicenceIds = new Set(justLicenceIds)

    const licences = []
    for (const id of uniqueLicenceIds) {
      // Iterate through our unique Licence Id's and use them to find the index for the first matching entry in the
      // charge versions data
      const index = data.chargeVersions.findIndex((chargeVersion) => chargeVersion.licenceId === id)
      // Destructure the licenceId and licenceRef from the matching object
      const { licenceId, licenceRef } = data.chargeVersions[index]

      // Push a new object into our array of licences
      licences.push({ licenceId, licenceRef })
    }

    return licences
  }

  _presentation (data) {
    const licences = this._licences(data)
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
      licences,
      chargeVersions
    }
  }
}

module.exports = SupplementaryPresenter
