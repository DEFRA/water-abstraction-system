'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderSeeder = require('../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchLicenceContactDetailsService = require('../../../app/services/licences/fetch-licence-contact-details.service.js')

describe('Fetch Licence Contact Details service', () => {
  let licence
  let licenceId
  let licenceRef
  let licenceDocumentHeaderId

  describe('when the licence has a licence document header', () => {
    before(async () => {
      const { primaryUser: licenceDocumentHeader } = await LicenceDocumentHeaderSeeder.seed(false)

      licence = await LicenceHelper.add({
        licenceRef: licenceDocumentHeader.licenceRef
      })

      licenceId = licence.id
      licenceRef = licence.licenceRef
      licenceDocumentHeaderId = licenceDocumentHeader.id
    })

    it('returns the matching licence and licence document header', async () => {
      const result = await FetchLicenceContactDetailsService.go(licenceId)

      expect(result).to.equal({
        id: licenceId,
        licenceRef,
        licenceDocumentHeader: {
          id: licenceDocumentHeaderId,
          licenceEntityRoles: [
            {
              role: 'primary_user',
              licenceEntity: {
                name: 'primary.user@important.com'
              }
            },
            {
              role: 'user_returns',
              licenceEntity: {
                name: 'returns.agent@important.com'
              }
            }
          ],
          metadata: {
            Name: 'Primary User test',
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
                name: 'Primary User test',
                postcode: 'WD25 7LR',
                role: 'Licence holder',
                salutation: null,
                town: 'Little Whinging',
                type: 'Person'
              },
              {
                addressLine1: '4',
                addressLine2: 'Privet Drive',
                addressLine3: null,
                addressLine4: null,
                country: null,
                county: 'Surrey',
                forename: 'Harry',
                initials: 'J',
                name: 'Primary User test',
                postcode: 'WD25 7LR',
                role: 'Returns to',
                salutation: null,
                town: 'Little Whinging',
                type: 'Person'
              }
            ],
            isCurrent: true,
            isSummer: true
          }
        }
      })
    })
  })
})
