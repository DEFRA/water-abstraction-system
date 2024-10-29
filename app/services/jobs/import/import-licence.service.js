'use strict'

/**
 * Extracts and imports licence refs from NALD
 * @module ImportLicence
 */

const FetchNaldLicenceRefs = require('./fetch-nald-licence-ref.service.js')
const ProcessImportLicence = require('./process-import-licence.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

/**
 * Extracts and imports licence refs from NALD
 *
 * If a licence in NALD does not have a status of DRAFT, and at least one non-draft licence version
 * then it will be extracted
 *
 */
async function go () {
  try {
    const startTime = currentTimeInNanoseconds()

    const licenceRefs = await FetchNaldLicenceRefs.go()

    ProcessImportLicence.go(licenceRefs)

    calculateAndLogTimeTaken(startTime, `Importing ${licenceRefs.length} licences from NALD`)
  } catch (error) {
    global.GlobalNotifier.omfg('Importing Licence job failed', null, error)
  }
}

module.exports = {
  go
}
