/**
 * Fetches verifications for an external user on the `/users/external/{id}/verifications` page
 * @module FetchVerificationsDal
 */

import UserVerificationModel from '../../../models/user-verification.model.js'

import DatabaseConfig from '../../../../config/database.config.js'

/**
 * Fetches verifications for an external user on the `/users/external/{id}/verifications` page
 *
 * @param {number} licenceEntityId - The licence entity ID of the requested user
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object[]>} the requested user verifications
 */
export default async function fetchVerifications(licenceEntityId, page = '1') {
  const { results: verifications, total: totalNumber } = await _fetch(licenceEntityId, page)

  return { totalNumber, verifications }
}

async function _fetch(licenceEntityId, page) {
  return UserVerificationModel.query()
    .select([
      'userVerifications.createdAt',
      'userVerifications.id',
      'userVerifications.verifiedAt',
      'userVerifications.verificationCode'
    ])
    .where('userVerifications.licenceEntityId', licenceEntityId)
    .orderBy('userVerifications.createdAt', 'DESC')
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
    .withGraphFetched('licenceDocumentHeaders')
    .modifyGraph('licenceDocumentHeaders', (licenceDocumentHeadersBuilder) => {
      licenceDocumentHeadersBuilder
        .select(['id', 'licenceRef'])
        .orderBy('licenceRef', 'asc')
        .withGraphFetched('licence')
        .modifyGraph('licence', (licenceBuilder) => {
          licenceBuilder.select(['id', 'licenceRef']).modify('licenceHolder')
        })
    })
}
