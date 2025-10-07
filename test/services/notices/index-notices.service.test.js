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
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchNoticesService = require('../../../app/services/notices/fetch-notices.service.js')

// Thing under test
const IndexNoticesService = require('../../../app/services/notices/index-notices.service.js')

describe('Notices - Index Notices service', () => {
  let auth
  let fetchResults
  let page
  let yarStub

  beforeEach(() => {
    auth = {
      credentials: { scope: ['bulk_return_notifications', 'returns'] }
    }
    Sinon.stub(FeatureFlagsConfig, 'enableSystemNoticeView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      // For the purposes of this tests the filter doesn't matter
      yarStub = { get: Sinon.stub().returns({ noticesFilter: _noticeFilters() }) }

      fetchResults = { results: [NoticesFixture.alertReduce()], total: 1 }
      Sinon.stub(FetchNoticesService, 'go').resolves(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await IndexNoticesService.go(yarStub, auth, page)

      expect(result).to.equal({
        activeNavBar: 'manage',
        filters: {
          fromDate: null,
          noticeTypes: [],
          openFilter: true,
          reference: null,
          sentBy: null,
          toDate: null,
          noticesFilter: {
            noticeTypes: [],
            reference: null,
            sentBy: null,
            sentFromDay: null,
            sentFromMonth: null,
            sentFromYear: null,
            sentToDay: null,
            sentToMonth: null,
            sentToYear: null
          }
        },
        links: {
          adhoc: {
            href: '/system/notices/setup/adhoc',
            text: 'Create an ad-hoc notice'
          },
          notice: {
            href: '/system/notices/setup/standard',
            text: 'Create a standard notice'
          }
        },
        notices: [
          {
            createdDate: '25 March 2025',
            link: `/system/notices/${fetchResults.results[0].id}`,
            recipients: fetchResults.results[0].recipientCount,
            reference: fetchResults.results[0].referenceCode,
            sentBy: 'billing.data@wrls.gov.uk',
            status: 'sent',
            type: 'Reduce alert'
          }
        ],
        pageSubHeading: 'View a notice',
        pageTitle: 'Notices',
        tableCaption: 'Showing all 1 notices',
        pagination: { numberOfPages: 1 }
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
        const result = await IndexNoticesService.go(yarStub, auth, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(_noticeFilters()) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexNoticesService.go(yarStub, auth, page)

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
        const result = await IndexNoticesService.go(yarStub, auth, page)

        expect(result.filters.openFilter).to.be.true()
      })
    })
  })
})

function _noticeFilters() {
  return {
    noticeTypes: [],
    reference: null,
    sentBy: null,
    sentFromDay: null,
    sentFromMonth: null,
    sentFromYear: null,
    sentToDay: null,
    sentToMonth: null,
    sentToYear: null
  }
}
