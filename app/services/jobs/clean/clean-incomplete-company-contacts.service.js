/**
 * Deletes incomplete company contacts which were abandoned during the creation journey
 * @module CleanIncompleteCompanyContactsService
 */

import CompanyContactModel from '../../../models/company-contact.model.js'

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
    globalThis.GlobalNotifier.omfg('Clean job failed', { job: 'clean-incomplete-company-contacts' }, error)
  }

  return deletedCount
}

export default {
  go
}
