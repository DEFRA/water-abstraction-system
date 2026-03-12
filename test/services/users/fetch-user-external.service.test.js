'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../support/helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const UserModel = require('../../../app/models/user.model.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')
const UserVerificationHelper = require('../../support/helpers/user-verification.helper.js')
const UserVerificationDocumentHelper = require('../../support/helpers/user-verification-document.helper.js')

// Thing under test
const FetchUserExternalService = require('../../../app/services/users/fetch-user-external.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So, we
// only create the related records.
describe('Users - Fetch User External service', () => {
  let companyEntity
  let licence1
  let licenceDocumentHeader1
  let licence2
  let licenceDocumentHeader2
  let licence3
  let licenceDocumentHeader3
  let licence4
  let licenceDocumentHeader4
  let licenceEntityRole
  let user
  let userEntity
  let userVerification
  let userVerificationDocument2
  let userVerificationDocument4

  before(async () => {
    user = UsersFixture.external()

    userEntity = await LicenceEntityHelper.add({ name: user.username, type: 'individual' })
    await UserModel.query().findById(user.id).patch({ licenceEntityId: userEntity.id })

    companyEntity = await LicenceEntityHelper.add({ name: 'Company 1', type: 'company' })

    licenceEntityRole = await LicenceEntityRoleHelper.add({
      licenceEntityId: userEntity.id,
      companyEntityId: companyEntity.id,
      role: 'primary_user'
    })

    // Add the licences in reverse alphabetical order to ensure the service is correctly ordering them by licenceRef,
    // not just returning them in the order they were added
    licence3 = await LicenceHelper.add({ licenceRef: 'FE/TC/H/US/ER/03' })
    licenceDocumentHeader3 = await LicenceDocumentHeaderHelper.add({
      companyEntityId: companyEntity.id,
      licenceRef: 'FE/TC/H/US/ER/03'
    })
    licence1 = await LicenceHelper.add({ licenceRef: 'FE/TC/H/US/ER/01' })
    licenceDocumentHeader1 = await LicenceDocumentHeaderHelper.add({
      companyEntityId: companyEntity.id,
      licenceRef: 'FE/TC/H/US/ER/01'
    })

    userVerification = await UserVerificationHelper.add({
      licenceEntityId: userEntity.id,
      companyEntityId: companyEntity.id
    })

    // Add the licences in reverse alphabetical order to ensure the service is correctly ordering them by licenceRef,
    // not just returning them in the order they were added
    licence4 = await LicenceHelper.add({ licenceRef: 'FE/TC/H/US/ER/04' })
    licenceDocumentHeader4 = await LicenceDocumentHeaderHelper.add({
      licenceRef: 'FE/TC/H/US/ER/04'
    })
    licence2 = await LicenceHelper.add({ licenceRef: 'FE/TC/H/US/ER/02' })
    licenceDocumentHeader2 = await LicenceDocumentHeaderHelper.add({
      licenceRef: 'FE/TC/H/US/ER/02'
    })
    userVerificationDocument4 = await UserVerificationDocumentHelper.add({
      userVerificationId: userVerification.id,
      licenceDocumentHeaderId: licenceDocumentHeader4.id
    })
    userVerificationDocument2 = await UserVerificationDocumentHelper.add({
      userVerificationId: userVerification.id,
      licenceDocumentHeaderId: licenceDocumentHeader2.id
    })
  })

  after(async () => {
    user = UsersFixture.external()
    await UserModel.query().findById(user.id).patch({ licenceEntityId: null })

    await userVerificationDocument4.$query().delete()
    await userVerificationDocument2.$query().delete()
    await userVerification.$query().delete()

    await licenceEntityRole.$query().delete()

    await licenceDocumentHeader1.$query().delete()
    await licence1.$query().delete()
    await licenceDocumentHeader2.$query().delete()
    await licence2.$query().delete()
    await licenceDocumentHeader3.$query().delete()
    await licence3.$query().delete()
    await licenceDocumentHeader4.$query().delete()
    await licence4.$query().delete()

    await companyEntity.$query().delete()
    await userEntity.$query().delete()
  })

  describe('when called', () => {
    beforeEach(() => {
      user = UsersFixture.external()
    })

    it('returns the requested user', async () => {
      const result = await FetchUserExternalService.go(user.id)
      expect(result).to.equal({
        enabled: user.enabled,
        id: user.id,
        lastLogin: user.lastLogin,
        licenceEntity: {
          id: userEntity.id,
          licenceEntityRoles: [
            {
              companyEntity: {
                id: companyEntity.id,
                licenceDocumentHeaders: [
                  {
                    licence: { id: licence1.id },
                    licenceRef: 'FE/TC/H/US/ER/01',
                    metadata: licenceDocumentHeader1.metadata
                  },
                  {
                    licence: { id: licence3.id },
                    licenceRef: 'FE/TC/H/US/ER/03',
                    metadata: licenceDocumentHeader3.metadata
                  }
                ],
                name: 'Company 1'
              },
              role: 'primary_user'
            }
          ],
          userVerifications: [
            {
              companyEntity: {
                id: companyEntity.id,
                name: companyEntity.name
              },
              createdAt: userVerification.createdAt,
              verificationCode: userVerification.verificationCode,
              licenceDocumentHeaders: [
                {
                  licence: { id: licence2.id },
                  licenceRef: 'FE/TC/H/US/ER/02',
                  metadata: licenceDocumentHeader2.metadata
                },
                {
                  licence: { id: licence4.id },
                  licenceRef: 'FE/TC/H/US/ER/04',
                  metadata: licenceDocumentHeader4.metadata
                }
              ]
            }
          ]
        },
        statusPassword: null,
        username: user.username
      })
    })
  })
})
