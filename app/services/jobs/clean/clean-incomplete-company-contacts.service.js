'use strict'

/**
 * Deletes incomplete company contacts which were abandoned during the creation journey
 * @module CleanIncompleteCompanyContactsService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')

/**
 * Deletes incomplete company contacts which were abandoned during the creation journey
 *
 * @returns {Promise<number>} The number of rows deleted
 */
async function go() {
  let deletedCount = 0

  try {
    deletedCount = await CompanyContactModel.query()
      .delete()
      .innerJoinRelated('licenceRole')
      .innerJoinRelated('contact')
      .where('licenceRole.name', 'additionalContact')
      .whereNull('contact.email')
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', { job: 'clean-incomplete-company-contacts' }, error)
  }

  return deletedCount
}

module.exports = {
  go
}
