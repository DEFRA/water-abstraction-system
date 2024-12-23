'use strict'

/**
 * Orchestrates fetching and presenting the data for `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 * @module CheckReturnsService
 */

const CheckReturnsPresenter = require('../../../presenters/notifications/ad-hoc-returns/check-returns.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const LicenceDocumentModel = require('../../../models/licence-document.model.js')
const { db } = require('../../../../db/db.js')

/**
 * Orchestrates fetching and presenting the data for `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 *
 * Supports generating the data needed for the check returns page in the ad-hoc returns notification journey. It fetches
 * the current session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {Promise<object>} The view data for the check returns page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const pageData = await _fetchPageData(session.licenceId)
  const licenceContacts = await _fetchLicenceContacts(session.licenceRef)
  console.log('🚀  pageData:', pageData)

  const formattedData = CheckReturnsPresenter.go(pageData, session, licenceContacts)
  console.log('🚀  formattedData :', formattedData)

  return {
    ...formattedData
  }
}

async function _fetchLicenceContacts(licenceRef) {
  const contacts2 = await LicenceDocumentModel.query()
    .where('licenceRef', licenceRef)
    .select('id')
    .withGraphFetched('licenceDocumentRoles')
    .modifyGraph('licenceDocumentRoles', (builder) => {
      builder
        .select([
          'licenceDocumentRoles.id as licenceDocumentRoleId',
          'addressId',
          'licenceRoleId',
          'companyId',
          'contactId'
        ])
        .innerJoin('licenceRoles', 'licenceRoles.id', 'licenceDocumentRoles.licenceRoleId')
        .where('licenceRoles.name', 'licenceHolder')
        .andWhere((builder) => {
          builder
            .whereNull('licenceDocumentRoles.endDate')
            .orWhere('licenceDocumentRoles.endDate', '>', db.raw('NOW()'))
        })
    })
    .withGraphFetched('licenceDocumentRoles.contact')
    .modifyGraph('licenceDocumentRoles.contact', (builder) => {
      builder.select([
        'id',
        'firstName',
        'initials',
        'middleInitials',
        'lastName',
        'salutation',
        'suffix',
        'salutation',
        'email',
        'department'
      ])
    })
    .first()

  console.log('🚀  contacts:', contacts2)

  return contacts2
}

async function _fetchPageData(licenceId) {
  return await LicenceModel.query()
    .findById(licenceId)
    .select(['id'])
    .modify('licenceHolder')
    .withGraphFetched('returnLogs')
    .modifyGraph('returnLogs', (builder) => {
      builder.select(['id', 'returnReference', 'dueDate']).where('status', 'due')
    })
}

module.exports = {
  go
}
