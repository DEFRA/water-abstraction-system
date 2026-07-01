'use strict'

// Test helpers
const EventModel = require('../../../../../app/models/event.model.js')
const LicenceDocumentHeaderHelper = require('../../../../support/helpers/licence-document-header.helper.js')
const LicenceDocumentHeaderModel = require('../../../../../app/models/licence-document-header.model.js')
const UsersFixture = require('../../../../support/fixtures/users.fixture.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const UnregisterLicencesDal = require('../../../../../app/dal/users/external/setup/unregister-licences.dal.js')

describe('Users - External - Setup - Unregister Licences DAL', () => {
  let licenceDocumentHeaders
  let session
  let user

  beforeAll(async () => {
    user = UsersFixture.nationalPermittingService()

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
          id: generateUUID(),
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
          id: generateUUID(),
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

    await EventModel.query()
      .delete()
      .where('type', 'unlink-licence')
      .whereRaw(`events.metadata->>'documentId' = ANY (?)`, [
        [licenceDocumentHeaders[0].id, licenceDocumentHeaders[1].id, licenceDocumentHeaders[2].id]
      ])
  })

  describe('when called', () => {
    it('unregisters the selected licences and records the unregistration as an "event"', async () => {
      await UnregisterLicencesDal.go(session, user)

      // Check first licence unregistered
      let updatedLicenceDocumentHeader = await LicenceDocumentHeaderModel.query().findById(licenceDocumentHeaders[0].id)
      let createdEvent = await EventModel.query()
        .where('type', 'unlink-licence')
        .whereRaw(`events.metadata->>'documentId' = ?`, [licenceDocumentHeaders[0].id])
        .first()

      expect(updatedLicenceDocumentHeader.companyEntityId).toBeNull()
      expect(createdEvent).toBeDefined()

      // Check second licence unregistered
      updatedLicenceDocumentHeader = await LicenceDocumentHeaderModel.query().findById(licenceDocumentHeaders[1].id)
      createdEvent = await EventModel.query()
        .where('type', 'unlink-licence')
        .whereRaw(`events.metadata->>'documentId' = ?`, [licenceDocumentHeaders[1].id])
        .first()

      expect(updatedLicenceDocumentHeader.companyEntityId).toBeNull()
      expect(createdEvent).toBeDefined()

      // Check third licence is still registered
      updatedLicenceDocumentHeader = await LicenceDocumentHeaderModel.query().findById(licenceDocumentHeaders[2].id)
      createdEvent = await EventModel.query()
        .where('type', 'unlink-licence')
        .whereRaw(`events.metadata->>'documentId' = ?`, [licenceDocumentHeaders[2].id])
        .first()

      expect(updatedLicenceDocumentHeader.companyEntityId).not.toBeNull()
      expect(createdEvent).toBeUndefined()
    })
  })
})
