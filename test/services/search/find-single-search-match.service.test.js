'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

// Thing under test
const FindSingleSearchMatchService = require('../../../app/services/search/find-single-search-match.service.js')

describe('Search - Find single search match service', () => {
  let licenceResults
  let returnLogResults
  let searchQuery

  async function returnLicenceResults() {
    return licenceResults
  }

  async function returnReturnLogResults() {
    return returnLogResults
  }

  beforeEach(() => {
    Sinon.stub(LicenceModel, 'query').returns({
      limit: Sinon.stub().callsFake(returnLicenceResults),
      where: Sinon.stub().returnsThis()
    })

    Sinon.stub(ReturnLogModel, 'query').returns({
      findById: Sinon.stub().callsFake(returnReturnLogResults)
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      searchQuery = 'v1:1:1/2/3:1:2000-01-01:2000-12-31'

      licenceResults = []
      returnLogResults = { id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31' }
    })

    it('returns a redirect for the matching record', async () => {
      const result = await FindSingleSearchMatchService.go(searchQuery)

      expect(result).to.equal('/system/return-logs?id=v1:1:1/2/3:1:2000-01-01:2000-12-31')
    })
  })

  describe('when called with a query that does not uniquely match a return or licence record', () => {
    beforeEach(() => {
      searchQuery = 'searchthis'

      licenceResults = []
      returnLogResults = null
    })

    it('returns a null response', async () => {
      const result = await FindSingleSearchMatchService.go(searchQuery)

      expect(result).to.be.null()
    })
  })

  describe('when called with a query that does not match an existing return log record', () => {
    beforeEach(() => {
      searchQuery = 'v1:1:1/2/3:1:2000-01-01:2000-12-31'

      licenceResults = []
      returnLogResults = null
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
      returnLogResults = null
    })

    it('returns a null response', async () => {
      const result = await FindSingleSearchMatchService.go(searchQuery)

      expect(result).to.be.null()
    })
  })

  describe('when called with a query that matches a single licence', () => {
    beforeEach(() => {
      licenceResults = [{ id: 'licence-1', licenceRef: 'this-is-the-licence-you-are-looking-for' }]
      returnLogResults = null
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
