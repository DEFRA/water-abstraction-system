'use strict'

/**
 * Deletes contacts which have become orphaned
 * @module CleanOrphanedContactsService
 */

const ContactModel = require('../../../models/contact.model.js')

/**
 * Deletes contacts which have become orphaned
 *
 * @returns {Promise<number>} The number of rows deleted
 */
async function go() {
  let deletedCount = 0

  try {
    deletedCount = await ContactModel.query().delete().whereRaw(`
NOT EXISTS (
  SELECT
    1
  FROM
    public.company_contacts cc
  WHERE
    cc.contact_id = contacts.id
)
AND NOT EXISTS (
  SELECT
    1
  FROM
    public.billing_account_addresses baa
  WHERE
    baa.contact_id = contacts.id
)
AND NOT EXISTS (
  SELECT
    1
  FROM
    public.licence_document_roles ldr
  WHERE
    ldr.contact_id = contacts.id
)`)
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', { job: 'clean-orphaned-contacts' }, error)
  }

  return deletedCount
}

module.exports = {
  go
}
