'use strict'

/**
 * Determines the relevant licence version for the start date selected, and which return versions are therefore copyable
 * @module DetermineRelevantLicenceVersionService
 */

const FetchRelevantLicenceVersionService = require('./fetch-relevant-licence-version.service.js')

/**
 * Determines the relevant licence version for the start date selected, and which return versions are therefore copyable
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Promise<LicenceVersionModel>} The relevant licence version and the licence's copyable return versions
 */
async function go(session) {
  const relevantLicenceVersion = await FetchRelevantLicenceVersionService.go(
    session.licence.id,
    session.returnVersionStartDate
  )

  relevantLicenceVersion.copyableReturnVersions = _copyableExistingReturnVersions(
    relevantLicenceVersion,
    session.licence.returnVersions
  )

  return relevantLicenceVersion
}

function _canCopyFrom(licenceVersion, returnVersionStartDate) {
  const { endDate, startDate } = licenceVersion

  const returnVersionStartDateTime = new Date(returnVersionStartDate).getTime()

  // The existing return version started before the relevant licence version (selected based on the start date entered
  // by the user for the _new_ return version). This means it may be based on abstraction data that is not in the
  // relevant licence version, so cannot be copied from for this period.
  if (returnVersionStartDateTime < startDate.getTime()) {
    return false
  }

  // The existing return version starts on or after the relevant licence version, and it has no end date. This means it
  // will be based on the same abstraction data, and can be copied from
  if (!endDate) {
    return true
  }

  // Return whether the return version starts before the relevant licence version ends. If it does, this means it will
  // be based on the same abstraction data, and can be copied from. Else it could be different so we cannot copy from it
  return returnVersionStartDateTime <= endDate.getTime()
}

function _copyableExistingReturnVersions(licenceVersion, returnVersions) {
  const copyableReturnVersions = []

  for (const returnVersion of returnVersions) {
    // NOTE: because the session data is stored in a JSONB field when we get the instance from the DB the date values
    // are in JS Date format (string). So, we have to convert them to a date before using them
    const dateObj = new Date(returnVersion.startDate)
    const canCopyFrom = _canCopyFrom(licenceVersion, dateObj.getTime())

    if (canCopyFrom) {
      copyableReturnVersions.push(returnVersion)
    }
  }

  return copyableReturnVersions
}

module.exports = {
  go
}
