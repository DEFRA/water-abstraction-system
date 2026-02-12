'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../support/helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchLicenceContactsService = require('../../../app/services/licences/fetch-licence-contacts.service.js')

describe('Licences - Fetch Licence Contacts service', () => {
  let companyEntity
  let licence
  let licenceDocumentHeader
  let licenceEntity
  let licenceEntityRole

  before(async () => {
    companyEntity = await LicenceEntityHelper.add({ type: 'company' })

    licenceEntity = await LicenceEntityHelper.add({})

    licenceEntityRole = await LicenceEntityRoleHelper.add({
      companyEntityId: companyEntity.id,
      licenceEntityId: licenceEntity.id,
      role: 'primary_user'
    })

    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      companyEntityId: companyEntity.id,
      metadata: {
        contacts: [
          {
            name: 'Potter',
            role: 'Licence holder',
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            postcode: 'WD25 7LR',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          }
        ]
      }
    })

    licence = await LicenceHelper.add({ licenceRef: licenceDocumentHeader.licenceRef })
  })

  after(async () => {
    await companyEntity.$query().delete()
    await licence.$query().delete()
    await licenceDocumentHeader.$query().delete()
    await licenceEntity.$query().delete()
    await licenceEntityRole.$query().delete()
  })

  describe('when called', () => {
    it('returns the licence contact', async () => {
      const result = await FetchLicenceContactsService.go(licence.id)

      expect(result).to.equal({
        id: licence.id,
        licenceRef: licence.licenceRef,
        licenceDocumentHeader: {
          id: licenceDocumentHeader.id,
          licenceEntityRoles: [
            {
              licenceEntity: {
                name: 'grace.hopper@example.com'
              },
              role: 'primary_user'
            }
          ],
          metadata: {
            contacts: [
              {
                addressLine1: '4',
                addressLine2: 'Privet Drive',
                addressLine3: null,
                addressLine4: null,
                country: null,
                county: 'Surrey',
                forename: 'Harry',
                initials: 'J',
                name: 'Potter',
                postcode: 'WD25 7LR',
                role: 'Licence holder',
                salutation: null,
                town: 'Little Whinging',
                type: 'Person'
              }
            ]
          }
        }
      })
    })
  })
})
