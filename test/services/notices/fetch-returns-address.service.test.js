'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchReturnsAddressService = require('../../../app/services/notices/fetch-returns-addresses.service.js')

describe('Notices - Fetch returns address service', () => {
  let seedData

  before(async () => {
    seedData = await LicenceDocumentHeaderSeeder.seed('2025-04-')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the licence is registered ', () => {
    describe('and there is a "primary user"', () => {
      it('returns the "Licence holder"', async () => {
        const result = await FetchReturnsAddressService.go([seedData.primaryUser.returnLog.returnId])

        expect(result).to.equal([_licenceHolderAddress(seedData, 'primaryUser')])
      })

      describe('and "returns agent" with different emails', () => {
        it('returns the "Licence holder"', async () => {
          const result = await FetchReturnsAddressService.go([seedData.primaryUserAndReturnsAgent.returnLog.returnId])

          expect(result).to.equal([_licenceHolderAddress(seedData, 'primaryUserAndReturnsAgent')])
        })
      })
    })
  })

  describe('when the licence is unregistered', () => {
    describe('and there is a "licence holder" but the return log isCurrent=false', () => {
      it('returns an empty array', async () => {
        const result = await FetchReturnsAddressService.go([seedData.licenceHolder.returnLog.returnId])

        expect(result).to.equal([])
      })
    })

    describe('and a "returns to" with different contacts', () => {
      it('returns the "licence holder"', async () => {
        const result = await FetchReturnsAddressService.go([seedData.licenceHolderAndReturnTo.returnLog.returnId])

        expect(result).to.equal([_licenceHolderAddress(seedData, 'licenceHolderAndReturnTo')])
      })
    })
  })

  describe('when a recipient has multiple return logs for the same recipient', () => {
    it('returns the "licence holder" with multiple return ids', async () => {
      const result = await FetchReturnsAddressService.go([
        seedData.primaryUserMultipleReturnLogs.returnLog.returnId,
        seedData.primaryUserMultipleReturnLogs.returnLogTwo.returnId
      ])

      expect(result).to.equal([_licenceHolderAddress(seedData, 'primaryUserMultipleReturnLogs')])
    })
  })
})

function _licenceHolderAddress(seedData, seedDataUser) {
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
      name: 'Licence holder',
      postcode: 'WD25 7LR',
      role: 'Licence holder',
      salutation: null,
      town: 'Little Whinging',
      type: 'Person'
    },
    contact_type: 'Licence holder',
    licence_refs: seedData[seedDataUser].licenceRef,
    return_log_ids: [
      seedData[seedDataUser].returnLog.returnId,
      ...(seedData[seedDataUser].returnLogTwo ? [seedData[seedDataUser].returnLogTwo.returnId] : [])
    ].sort()
  }
}
