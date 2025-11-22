'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchAlternateRecipientsService = require('../../../../app/services/notices/setup/fetch-alternate-recipients.service.js')

describe('Notices - Setup - Fetch Alternate Recipients service', () => {
  let licenceHolder
  let primaryUser

  before(async () => {
    licenceHolder = await LicenceDocumentHeaderSeeder.licenceHolder('2025-05-02')
    primaryUser = await LicenceDocumentHeaderSeeder.primaryUser('2025-05-01')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the licence is registered ', () => {
    describe('because there is a primary user', () => {
      it('returns the "Licence holder" not the "Primary User"', async () => {
        const result = await FetchAlternateRecipientsService.go([primaryUser.returnLog.returnId])

        expect(result).to.equal([_licenceHolderAddress(primaryUser)])
      })
    })
  })

  describe('when the licence is unregistered ', () => {
    it('returns the "Licence holder"', async () => {
      const result = await FetchAlternateRecipientsService.go([licenceHolder.returnLog.returnId])

      expect(result).to.equal([_licenceHolderAddress(licenceHolder)])
    })
  })
})

function _licenceHolderAddress(seedData) {
  return {
    contact: {
      addressLine1: '4',
      addressLine2: 'Privet Drive',
      addressLine3: null,
      addressLine4: null,
      country: null,
      county: 'Surrey',
      forename: 'Harry',
      initials: 'J',
      name: seedData.metadata.contacts[0].name,
      postcode: 'WD25 7LR',
      role: 'Licence holder',
      salutation: null,
      town: 'Little Whinging',
      type: 'Person'
    },
    contact_type: 'Licence holder',
    licence_refs: [seedData.licenceRef],
    return_log_ids: [
      seedData.returnLog.returnId,
      ...(seedData.returnLogTwo ? [seedData.returnLogTwo.returnId] : [])
    ].sort()
  }
}
