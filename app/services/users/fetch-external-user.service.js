'use strict'

/**
 * Fetches an external user for display on the /users/{userId} page
 * @module FetchExternalUserService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches an external user for display on the /users/{userId} page
 *
 * This includes their related companies and the licence document headers that are attached to those companies.
 *
 * @param {number} userId - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(userId) {
  const user = await UserModel.query()
    .select(['id', 'username'])
    .modify('status')
    .withGraphFetched('licenceEntity.licenceEntityRoles.companyEntity.licenceDocumentHeaders.licence')
    .withGraphFetched('licenceEntity.userVerifications.companyEntity')
    .withGraphFetched('licenceEntity.userVerifications.licenceDocumentHeaders.licence')
    .modifyGraph('licenceEntity', (builder) => {
      builder.select(['id'])
    })
    .modifyGraph('licenceEntity.licenceEntityRoles', (builder) => {
      builder.select(['role'])
    })
    .modifyGraph('licenceEntity.licenceEntityRoles.companyEntity', (builder) => {
      builder.select(['id', 'name'])
    })
    .modifyGraph('licenceEntity.licenceEntityRoles.companyEntity.licenceDocumentHeaders', (builder) => {
      builder.select(['licenceRef', 'metadata'])
      builder.orderBy('licenceRef', 'asc')
    })
    .modifyGraph('licenceEntity.licenceEntityRoles.companyEntity.licenceDocumentHeaders.licence', (builder) => {
      builder.select(['id'])
    })
    .modifyGraph('licenceEntity.userVerifications', (builder) => {
      builder.select(['createdAt', 'verificationCode']).whereNull('verifiedAt')
    })
    .modifyGraph('licenceEntity.userVerifications.companyEntity', (builder) => {
      builder.select(['id', 'name'])
    })
    .modifyGraph('licenceEntity.userVerifications.licenceDocumentHeaders', (builder) => {
      builder.select(['licenceRef', 'metadata'])
      builder.orderBy('licenceRef', 'asc')
    })
    .modifyGraph('licenceEntity.userVerifications.licenceDocumentHeaders.licence', (builder) => {
      builder.select(['id'])
    })
    .findById(userId)

  return user
}

module.exports = {
  go
}
