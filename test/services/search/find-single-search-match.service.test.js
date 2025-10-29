'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const LicenceModel = require('../../../app/models/licence.model.js')

// Thing under test
const FindSingleSearchMatchService = require('../../../app/services/search/find-single-search-match.service.js')

describe('Search - Find single search match service', () => {
  let licenceResults
  let searchQuery

  async function returnLicenceResults() {
    return licenceResults
  }

  beforeEach(() => {
    Sinon.stub(LicenceModel, 'query').returns({
      limit: Sinon.stub().callsFake(returnLicenceResults),
      where: Sinon.stub().returnsThis()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      searchQuery = '123'

      licenceResults = [{ id: 'licence-1', licenceRef: '123' }]
    })

    it('returns a redirect for the matching record', async () => {
      const result = await FindSingleSearchMatchService.go(searchQuery)

      expect(result).to.equal('/system/licences/licence-1/summary')
    })
  })

  describe('when called with a query that does not uniquely match any records', () => {
    beforeEach(() => {
      searchQuery = 'searchthis'

      licenceResults = []
    })

    it('returns a null response', async () => {
      const result = await FindSingleSearchMatchService.go(searchQuery)

      expect(result).to.be.null()
    })
  })

  describe('when called with a query that matches multiple licences', () => {
    beforeEach(() => {
      searchQuery = 'searchthis'

      licenceResults = [{ id: 'licence-1' }, { id: 'licence-2' }]
    })

    it('returns a null response', async () => {
      const result = await FindSingleSearchMatchService.go(searchQuery)

      expect(result).to.be.null()
    })
  })

  describe('when called with a query that matches a single licence', () => {
    beforeEach(() => {
      licenceResults = [{ id: 'licence-1', licenceRef: 'this-is-the-licence-you-are-looking-for' }]
    })

    describe('but the search term does not exactly match the licence number', () => {
      beforeEach(() => {
        searchQuery = 'not-the-licence-you-are-looking-for'
      })

      it('returns a null response', async () => {
        const result = await FindSingleSearchMatchService.go(searchQuery)

        expect(result).to.be.null()
      })
    })

    describe('and the search term exactly matches the licence number', () => {
      beforeEach(() => {
        searchQuery = 'this-is-the-licence-you-are-looking-for'
      })

      it('returns a redirect for the matching record', async () => {
        const result = await FindSingleSearchMatchService.go(searchQuery)

        expect(result).to.equal('/system/licences/licence-1/summary')
      })
    })
  })
})
