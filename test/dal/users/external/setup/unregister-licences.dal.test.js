// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceDocumentHeaderHelper from '../../../../support/helpers/licence-document-header.helper.js'
import LicenceDocumentHeaderModel from '../../../../../app/models/licence-document-header.model.js'
import LicenceUnregistrationModel from '../../../../../app/models/licence-unregistration.model.js'
import UsersFixture from '../../../../support/fixtures/users.fixture.js'
import { generateUUID } from '../../../../support/generators.js'

// Thing under test
import UnregisterLicencesDal from '../../../../../app/dal/users/external/setup/unregister-licences.dal.js'

describe('Users - External - Setup - Unregister Licences DAL', () => {
  let firstLicenceId
  let licenceDocumentHeaders
  let secondLicenceId
  let session
  let user

  beforeAll(async () => {
    user = UsersFixture.nationalPermittingService()

    firstLicenceId = generateUUID()
    secondLicenceId = generateUUID()

    licenceDocumentHeaders = [
      // First licence to be unregistered
      await LicenceDocumentHeaderHelper.add({ companyEntityId: generateUUID() }),
      // Second licence to be unregistered
      await LicenceDocumentHeaderHelper.add({ companyEntityId: generateUUID() }),
      // Third licence that should not be unregistered
      await LicenceDocumentHeaderHelper.add({ companyEntityId: generateUUID() })
    ]

    session = {
      activeNavBar: 'users',
      allLicences: true,
      id: generateUUID(),
      licences: [
        {
          id: firstLicenceId,
          licenceDocumentHeaderId: licenceDocumentHeaders[0].id,
          licenceRef: licenceDocumentHeaders[0].licenceRef,
          licenceVersions: [
            {
              id: generateUUID(),
              issueDate: null,
              licenceId: generateUUID(),
              startDate: new Date('2022-04-01'),
              status: 'current',
              company: {
                id: generateUUID(),
                name: 'ACME Farms Ltd',
                type: 'organisation'
              }
            }
          ]
        },
        {
          id: secondLicenceId,
          licenceDocumentHeaderId: licenceDocumentHeaders[1].id,
          licenceRef: licenceDocumentHeaders[1].licenceRef,
          licenceVersions: [
            {
              id: generateUUID(),
              issueDate: null,
              licenceId: generateUUID(),
              startDate: new Date('2023-04-01'),
              status: 'current',
              company: {
                id: generateUUID(),
                name: 'ACME Industry Ltd',
                type: 'organisation'
              }
            }
          ]
        }
      ],
      selectedLicences: [],
      user: {
        id: generateUUID(),
        licenceEntityId: generateUUID(),
        username: 'jon.lee@example.co.uk'
      }
    }
  })

  afterAll(async () => {
    for (const licenceDocumentHeader of licenceDocumentHeaders) {
      await licenceDocumentHeader.$query().delete()
    }

    await LicenceUnregistrationModel.query().delete().whereIn('licenceId', [firstLicenceId, secondLicenceId])
  })

  describe('when called', () => {
    it('unregisters the selected licences and records the unregistration', async () => {
      await UnregisterLicencesDal(session, user)

      // Check first licence unregistered
      let updatedLicenceDocumentHeader = await LicenceDocumentHeaderModel.query().findById(licenceDocumentHeaders[0].id)
      let createdLicenceUnregistration = await LicenceUnregistrationModel.query()
        .where('licenceId', firstLicenceId)
        .first()

      expect(updatedLicenceDocumentHeader.companyEntityId).toBeNull()
      expect(createdLicenceUnregistration).toBeDefined()
      expect(createdLicenceUnregistration.createdBy).toEqual(user.id)

      // Check second licence unregistered
      updatedLicenceDocumentHeader = await LicenceDocumentHeaderModel.query().findById(licenceDocumentHeaders[1].id)
      createdLicenceUnregistration = await LicenceUnregistrationModel.query()
        .where('licenceId', secondLicenceId)
        .first()

      expect(updatedLicenceDocumentHeader.companyEntityId).toBeNull()
      expect(createdLicenceUnregistration).toBeDefined()
      expect(createdLicenceUnregistration.createdBy).toEqual(user.id)

      // Check third licence is still registered
      updatedLicenceDocumentHeader = await LicenceDocumentHeaderModel.query().findById(licenceDocumentHeaders[2].id)

      expect(updatedLicenceDocumentHeader.companyEntityId).not.toBeNull()
    })
  })
})
