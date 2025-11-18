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
const FetchLicenceHolderSearchResultsService = require('../../../app/services/search/fetch-licence-holder-search-results.service.js')

describe('Search - Fetch licence holder search results service', () => {
  const licences = []

  before(async () => {
    let licence
    let licenceDocumentHeader
    let licenceHolderSeedData

    // Add the licences in non-alphabetical order to prove the ordering in the results

    licence = await LicenceHelper.add({ licenceRef: '02/01/TESTHOLDERSEARCH01/05' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'Test search holder 2')
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceRef: licence.licenceRef,
      metadata: { contacts: [{ name: 'Test search holder 2', role: 'Licence holder' }] }
    })
    licences.push({ licence, licenceDocumentHeader, licenceHolderSeedData })

    licence = await LicenceHelper.add({ licenceRef: '01/02/TESTHOLDERSEARCH02/06' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'Test search holder 11')
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceRef: licence.licenceRef,
      metadata: { contacts: [{ name: 'Test search holder 11', role: 'Licence holder' }] }
    })
    licences.push({ licence, licenceDocumentHeader, licenceHolderSeedData })
  })

  describe('when matching licence holders exist', () => {
    it('returns the correctly ordered matching licence holders', async () => {
      const result = await FetchLicenceHolderSearchResultsService.go('Test search holder', 1)

      expect(result).to.equal({
        results: [
          {
            holderName: 'Test search holder 11',
            holderType: null,
            id: licences[1].licence.id,
            licenceRef: '01/02/TESTHOLDERSEARCH02/06'
          },
          {
            holderName: 'Test search holder 2',
            holderType: null,
            id: licences[0].licence.id,
            licenceRef: '02/01/TESTHOLDERSEARCH01/05'
          }
        ],
        total: 2
      })
    })
  })

  describe('when only one matching licence holder exists', () => {
    it('returns the correct licence holder', async () => {
      const result = await FetchLicenceHolderSearchResultsService.go('Test search holder 1', 1)

      expect(result).to.equal({
        results: [
          {
            holderName: 'Test search holder 11',
            holderType: null,
            id: licences[1].licence.id,
            licenceRef: '01/02/TESTHOLDERSEARCH02/06'
          }
        ],
        total: 1
      })
    })
  })

  describe('when the case of the search text does not match that of the licence holder', () => {
    it('still returns the correct licence holders', async () => {
      const result = await FetchLicenceHolderSearchResultsService.go('tEsT sEaRcH hOlDeR', 1)

      expect(result).to.equal({
        results: [
          {
            holderName: 'Test search holder 11',
            holderType: null,
            id: licences[1].licence.id,
            licenceRef: '01/02/TESTHOLDERSEARCH02/06'
          },
          {
            holderName: 'Test search holder 2',
            holderType: null,
            id: licences[0].licence.id,
            licenceRef: '02/01/TESTHOLDERSEARCH01/05'
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
      const result = await FetchLicenceHolderSearchResultsService.go('Test search holder', 2)

      expect(result).to.equal({
        results: [
          {
            holderName: 'Test search holder 2',
            holderType: null,
            id: licences[0].licence.id,
            licenceRef: '02/01/TESTHOLDERSEARCH01/05'
          }
        ],
        total: 2
      })
    })
  })

  describe('when no matching licence holders exist', () => {
    it('returns empty query results', async () => {
      const result = await FetchLicenceHolderSearchResultsService.go('Test search holder 99', 1)

      expect(result).to.equal({
        results: [],
        total: 0
      })
    })
  })

  describe('when searching for an exact match', () => {
    it('returns the correct licence holder', async () => {
      const result = await FetchLicenceHolderSearchResultsService.go('Test search holder 11', 1, true)

      expect(result).to.equal({
        results: [
          {
            holderName: 'Test search holder 11',
            holderType: null,
            id: licences[1].licence.id,
            licenceRef: '01/02/TESTHOLDERSEARCH02/06'
          }
        ],
        total: 1
      })
    })
  })
})
