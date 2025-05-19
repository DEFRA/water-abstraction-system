'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')

// Things to stub
const FetchNoticesService = require('../../../app/services/notices/fetch-notices.service.js')

// Thing under test
const IndexNoticesService = require('../../../app/services/notices/index-notices.service.js')

describe('Notices - Index Notices service', () => {
  let fetchResults
  let page
  let yarStub

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are multiple pages of results', () => {
    beforeEach(() => {
      // For the purposes of these tests the filter doesn't matter
      yarStub = { get: Sinon.stub().returns({ noticesFilter: _noticeFilters() }) }

      // NOTE: The presenter tests cover ensuring the page data is as expected. We don't need to replicate them here.
      // So, we pretend there are lots of results, even though we just return one. It helps reduce the noise in these
      // tests.
      fetchResults = { results: [NoticesFixture.alertReduce()], total: 70 }
      Sinon.stub(FetchNoticesService, 'go').resolves(fetchResults)
    })

    describe('and no "page" was selected', () => {
      beforeEach(() => {
        page = undefined
      })

      it('returns the first page of notices, the title with page info and a pagination component for the view', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.notices).to.have.length(1)
        expect(result.pageTitle).to.equal('Notices (page 1 of 3)')
        expect(result.pagination.component).to.exist()
      })
    })

    describe('and a "page" other than 1 was selected', () => {
      beforeEach(() => {
        page = 2
      })

      it('returns the selected page of notices, the title with page info and a pagination component for the view', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.notices).to.have.length(1)
        expect(result.pageTitle).to.equal('Notices (page 2 of 3)')
        expect(result.pagination.component).to.exist()
      })
    })
  })

  describe('when there is only one page of results', () => {
    beforeEach(() => {
      // For the purposes of these tests the filter doesn't matter
      yarStub = { get: Sinon.stub().returns({ noticesFilter: _noticeFilters() }) }

      fetchResults = { results: [NoticesFixture.alertReduce()], total: 1 }
      Sinon.stub(FetchNoticesService, 'go').resolves(fetchResults)
    })

    describe('and no "page" was selected', () => {
      beforeEach(() => {
        page = undefined
      })

      it('returns all notices, the title without page info and no pagination component for the view', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.notices).to.have.length(1)
        expect(result.pageTitle).to.equal('Notices')
        expect(result.pagination.component).not.to.exist()
      })
    })

    describe('and a "page" other than 1 was selected', () => {
      beforeEach(() => {
        page = 2
      })

      it('returns all notices, the title without page info and no pagination component for the view', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.notices).to.have.length(1)
        expect(result.pageTitle).to.equal('Notices')
        expect(result.pagination.component).not.to.exist()
      })
    })
  })

  describe('when are no results', () => {
    beforeEach(() => {
      // For the purposes of these tests the filter doesn't matter
      yarStub = { get: Sinon.stub().returns({ noticesFilter: _noticeFilters() }) }

      fetchResults = { results: [], total: 0 }
      Sinon.stub(FetchNoticesService, 'go').resolves(fetchResults)
    })

    describe('and no "page" was selected', () => {
      beforeEach(() => {
        page = undefined
      })

      it('returns no notices, the title without page info and no pagination component for the view', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.notices).to.be.empty()
        expect(result.pageTitle).to.equal('Notices')
        expect(result.pagination.component).not.to.exist()
      })
    })

    describe('and a "page" other than 1 was selected', () => {
      beforeEach(() => {
        page = 2
      })

      it('returns no notices, the title without page info and no pagination component for the view', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.notices).to.be.empty()
        expect(result.pageTitle).to.equal('Notices')
        expect(result.pagination.component).not.to.exist()
      })
    })
  })

  describe('when the filters are assessed', () => {
    beforeEach(() => {
      // For the purposes of these tests the results don't matter
      fetchResults = { results: [], total: 0 }
      Sinon.stub(FetchNoticesService, 'go').resolves(fetchResults)
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(null) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(_noticeFilters()) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _noticeFilters()

        filters.sentBy = 'carol.shaw@wrls.gov.uk'
        yarStub = { get: Sinon.stub().returns(filters) }
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await IndexNoticesService.go(yarStub, page)

        expect(result.filters.openFilter).to.be.true()
      })
    })
  })
})

function _noticeFilters() {
  return {
    noticeTypes: [],
    sentBy: null,
    sentFromDay: null,
    sentFromMonth: null,
    sentFromYear: null,
    sentToDay: null,
    sentToMonth: null,
    sentToYear: null
  }
}
