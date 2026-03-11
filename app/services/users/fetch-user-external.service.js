'use strict'

/**
 * Fetches an external user for display on the `/users/external/{id}` page
 * @module FetchUserExternalService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches an external user for display on the `/users/external/{id}` page
 *
 * This includes their related companies and the licence document headers that are attached to those companies.
 *
 * @param {number} id - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(id) {
  const user = await UserModel.query()
    .select(['id', 'username'])
    .modify('status')
    .withGraphFetched('licenceEntity')
    .modifyGraph('licenceEntity', (licenceEntityBuilder) => {
      licenceEntityBuilder
        .select(['id'])
        .withGraphFetched('licenceEntityRoles')
        .modifyGraph('licenceEntityRoles', (licenceEntityRolesBuilder) => {
          licenceEntityRolesBuilder
            .select(['role'])
            .withGraphFetched('companyEntity')
            .modifyGraph('companyEntity', (companyEntityBuilder) => {
              companyEntityBuilder
                .select(['id', 'name'])
                .withGraphFetched('licenceDocumentHeaders')
                .modifyGraph('licenceDocumentHeaders', (licenceDocumentHeadersBuilder) => {
                  licenceDocumentHeadersBuilder
                    .select(['licenceRef', 'metadata'])
                    .orderBy('licenceRef', 'asc')
                    .withGraphFetched('licence')
                    .modifyGraph('licence', (licenceBuilder) => {
                      licenceBuilder.select(['id'])
                    })
                })
            })
        })
        .withGraphFetched('userVerifications')
        .modifyGraph('userVerifications', (userVerificationsBuilder) => {
          userVerificationsBuilder
            .select(['createdAt', 'verificationCode'])
            .whereNull('verifiedAt')
            .withGraphFetched('companyEntity')
            .modifyGraph('companyEntity', (companyEntityBuilder) => {
              companyEntityBuilder.select(['id', 'name'])
            })
            .withGraphFetched('licenceDocumentHeaders')
            .modifyGraph('licenceDocumentHeaders', (licenceDocumentHeadersBuilder) => {
              licenceDocumentHeadersBuilder
                .select(['licenceRef', 'metadata'])
                .orderBy('licenceRef', 'asc')
                .withGraphFetched('licence')
                .modifyGraph('licence', (licenceBuilder) => {
                  licenceBuilder.select(['id'])
                })
            })
        })
    })
    .findById(id)

  return user
}

module.exports = {
  go
}
