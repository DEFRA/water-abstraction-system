'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchLicenceSearchResultsService = require('../../../app/services/search/fetch-licence-search-results.service.js')

describe('Search - Fetch licence search results service', () => {
  const licences = []

  before(async () => {
    let licence
    let licenceDocumentHeader
    let licenceHolderSeedData

    // Add the licences in non-alphabetical order to prove the ordering in the results

    licence = await LicenceHelper.add({ licenceRef: '02/01/TESTSEARCH01/05' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'Test search holder 1')
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceRef: licence.licenceRef,
      metadata: { Name: 'Test search holder 1' }
    })
    licences.push({ licence, licenceDocumentHeader, licenceHolderSeedData })

    licence = await LicenceHelper.add({ licenceRef: '01/02/TESTSEARCH02/06' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'Test search holder 2')
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceRef: licence.licenceRef,
      metadata: { Name: 'Test search holder 2' }
    })
    licences.push({ licence, licenceDocumentHeader, licenceHolderSeedData })
  })

  describe('when matching licences exist', () => {
    it('returns the correctly ordered matching licences', async () => {
      const result = await FetchLicenceSearchResultsService.go('TESTSEARCH', 1)

      expect(result).to.equal({
        results: [
          {
            expiredDate: null,
            id: licences[1].licence.id,
            lapsedDate: null,
            licenceRef: licences[1].licence.licenceRef,
            metadata: licences[1].licenceDocumentHeader.metadata,
            revokedDate: null
          },
          {
            expiredDate: null,
            id: licences[0].licence.id,
            lapsedDate: null,
            licenceRef: licences[0].licence.licenceRef,
            metadata: licences[0].licenceDocumentHeader.metadata,
            revokedDate: null
          }
        ],
        total: 2
      })
    })
  })

  describe('when only one matching licence exists', () => {
    it('returns the correct licence', async () => {
      const result = await FetchLicenceSearchResultsService.go('TESTSEARCH01', 1)

      expect(result).to.equal({
        results: [
          {
            expiredDate: null,
            id: licences[0].licence.id,
            lapsedDate: null,
            licenceRef: licences[0].licence.licenceRef,
            metadata: licences[0].licenceDocumentHeader.metadata,
            revokedDate: null
          }
        ],
        total: 1
      })
    })
  })

  describe('when the case of the search text does not match that of the licence reference', () => {
    it('still returns the correct licences', async () => {
      const result = await FetchLicenceSearchResultsService.go('tEsTsEaRcH', 1)

      expect(result).to.equal({
        results: [
          {
            expiredDate: null,
            id: licences[1].licence.id,
            lapsedDate: null,
            licenceRef: licences[1].licence.licenceRef,
            metadata: licences[1].licenceDocumentHeader.metadata,
            revokedDate: null
          },
          {
            expiredDate: null,
            id: licences[0].licence.id,
            lapsedDate: null,
            licenceRef: licences[0].licence.licenceRef,
            metadata: licences[0].licenceDocumentHeader.metadata,
            revokedDate: null
          }
        ],
        total: 2
      })
    })
  })

  describe('when multiple pages of results exist', () => {
    beforeEach(() => {
      // Set the page size to 1 to force multiple pages of results
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1)
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('correctly returns the requested page of results', async () => {
      const result = await FetchLicenceSearchResultsService.go('TESTSEARCH', 2)

      expect(result).to.equal({
        results: [
          {
            expiredDate: null,
            id: licences[0].licence.id,
            lapsedDate: null,
            licenceRef: licences[0].licence.licenceRef,
            metadata: licences[0].licenceDocumentHeader.metadata,
            revokedDate: null
          }
        ],
        total: 2
      })
    })
  })

  describe('when no matching licences exist', () => {
    it('returns empty query results', async () => {
      const result = await FetchLicenceSearchResultsService.go('TESTSEARCH99', 1)

      expect(result).to.equal({
        results: [],
        total: 0
      })
    })
  })
})
