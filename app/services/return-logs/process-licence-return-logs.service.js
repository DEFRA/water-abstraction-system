'use strict'

/**
 * Process voiding and reissuing return logs for a given licence reference
 * @module ProcessLicenceReturnLogsService
 */

const { determineEarliestDate } = require('../../lib/dates.lib.js')
const CheckReturnCycleService = require('./check-return-cycle.service.js')
const CreateReturnLogsService = require('./create-return-logs.service.js')
const FetchLicenceReturnRequirementsService = require('./fetch-licence-return-requirements.service.js')
const ReturnCycleModel = require('../../models/return-cycle.model.js')
const VoidLicenceReturnLogsService = require('./void-licence-return-logs.service.js')

/**
 * Process voiding and reissuing return logs for a given licence reference
 *
 * When something in a licence changes, we are required to void existing return logs and recreate them based on the new
 * data.
 *
 * For example, a new return version could be added, an existing one superseded, or the licence itself is 'ended'.
 *
 * The challenge is to avoid voiding return logs that are not affected by the change. When we void a return log,
 * especially a completed one, because when we do so the business is required to re-key the information against the new
 * return log (we can't just copy the data because we don't know if the change means the previous values are invalid).
 *
 * So, the process starts with the change date. Using it we can identify the which return cycles might be affected. For
 * each return cycle, we fetch the licence's return requirements (also filtered by the change date).
 *
 * From those return requirements we attempt to create the new return logs. If the generated return log differs from the
 * existing one, it will be inserted. Else, it will be skipped.
 *
 * We pass _all_ the generated return log IDs to our `VoidLicenceReturnLogsService`, which uses them to identify the
 * ones for a given return cycle that should _not_ be voided.
 *
 * In theory, you could pass in a licence ID and change date that reflects when it started, and the 'engine' would
 * neither add nor void any return logs. We highlight this fact to try and help explain how the engine looks at each
 * cycle, and re-generates the return logs based on the current data for that return cycle, only reissuing that
 * which has changed.
 *
 * @param {string} licenceId - The UUID of the licence to create return logs for
 * @param {Date} [changeDate] - An optional change date to use when determining which return logs to void and reissue
 */
async function go(licenceId, changeDate = null) {
  if (!changeDate) {
    changeDate = new Date()
  }

  const returnRequirements = await FetchLicenceReturnRequirementsService.go(licenceId, changeDate)

  if (returnRequirements.length === 0) {
    return
  }

  const hasSummerRequirements = returnRequirements.find((requirement) => {
    return requirement.summer === true
  })

  if (hasSummerRequirements) {
    await CheckReturnCycleService.go(true, changeDate)
  }

  const hasAllYearRequirements = returnRequirements.find((requirement) => {
    return requirement.summer === false
  })

  if (hasAllYearRequirements) {
    await CheckReturnCycleService.go(false, changeDate)
  }

  const licenceRef = returnRequirements[0].returnVersion.licence.licenceRef
  const licenceEndDate = _endDate(returnRequirements[0].returnVersion)
  const returnCycles = await _fetchReturnCycles(changeDate)

  for (const returnCycle of returnCycles) {
    await _processReturnCycle(returnCycle, returnRequirements, changeDate, licenceRef, licenceEndDate)
  }
}

function _endDate(returnVersion) {
  const { licence } = returnVersion

  return determineEarliestDate([licence.expiredDate, licence.lapsedDate, licence.revokedDate])
}

async function _fetchReturnCycles(changeDate) {
  const query = ReturnCycleModel.query()
    .select(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
    .where('endDate', '>=', changeDate)

  return query.orderBy('endDate', 'desc')
}

async function _processReturnCycle(returnCycle, returnRequirements, changeDate, licenceRef, licenceEndDate) {
  // Determine if we have any return requirements that match the cycle being processed
  const requirementsToProcess = returnRequirements.filter((returnRequirement) => {
    return (
      returnRequirement.summer === returnCycle.summer &&
      returnRequirement.returnVersion.startDate <= returnCycle.endDate &&
      (returnRequirement.returnVersion.endDate >= returnCycle.startDate ||
        returnRequirement.returnVersion.endDate === null)
    )
  })

  if (requirementsToProcess.length === 0) {
    return
  }

  const generatedReturnLogIds = []

  // If there is no licenceEndDate or if there is a licenceEndDate and the return cycle starts before the licenceEndDate
  // then create the return logs, otherwise just void the return logs for that cycle
  if (!licenceEndDate || returnCycle.startDate < licenceEndDate) {
    // Iterate through the requirements and call CreateReturnLogsService. It will generate a return log from the data
    // provided and attempt to insert it. If it generates a return log that already exists (denoted by the return ID
    // matching an existing one), the insert will be ignored.
    //
    // All generated return ID's are returned by the service and used by VoidLicenceReturnLogsService to identify which
    // return logs for the given cycle _not_ to mark as 'void'.
    //
    // Because we've processed _all_ return requirements for the cycle, we know any return logs whose ID is not in
    // `generatedReturnLogIds` have been made redundant by whatever the 'change' was
    for (const returnRequirement of requirementsToProcess) {
      const returnLogIds = await CreateReturnLogsService.go(returnRequirement, returnCycle, licenceEndDate)

      generatedReturnLogIds.push(...returnLogIds)
    }
  }

  await VoidLicenceReturnLogsService.go(generatedReturnLogIds, licenceRef, returnCycle.id, changeDate)
}

module.exports = {
  go
}
