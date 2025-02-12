'use strict'

/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 * @module VoidNoReturnRequiredLicenceReturnLogsService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const ReturnLogModel = require('../../models/return-log.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 *
 * @param {string} returnVersionId - The return version id for the no returns required version
 */
async function go(returnVersionId) {
  const returnVersion = await ReturnVersionModel.query()
    .findById(returnVersionId)
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['id', 'licenceRef'])
    })

  const query = ReturnLogModel.query()
    .patch({ status: 'void', updatedAt: timestampForPostgres() })
    .where('licenceRef', returnVersion.licence.licenceRef)
    .where('startDate', '>=', returnVersion.startDate)

  if (returnVersion.endDate) {
    query.where('endDate', '<=', returnVersion.endDate)
  }

  await query
}

module.exports = {
  go
}
