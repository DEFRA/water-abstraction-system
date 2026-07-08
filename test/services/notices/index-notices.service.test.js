// Test framework dependencies

// Test helpers
import * as NoticesFixture from '../../support/fixtures/notices.fixture.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Things to stub
import FetchNoticesService from '../../../app/services/notices/fetch-notices.service.js'

// Thing under test
import IndexNoticesService from '../../../app/services/notices/index-notices.service.js'

describe('Notices - Index Notices service', () => {
  let auth
  let fetchResults
  let page
  let yarStub

  beforeEach(() => {
    auth = {
      credentials: { scope: ['bulk_return_notifications', 'returns'] }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    beforeEach(() => {
      // For the purposes of this tests the filter doesn't matter
      yarStub = YarStub()
      yarStub.get.mockReturnValue(null)

      const results = NoticesFixture.mapToFetchNoticesResult([NoticesFixture.alertReduce()])

      fetchResults = { results, total: 1 }
      vi.mock('../../../app/services/notices/fetch-notices.service.js')
      FetchNoticesService.mockResolvedValue(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await IndexNoticesService(yarStub, auth, page)

      expect(result).toEqual({
        activeNavBar: 'notices',
        filters: {
          fromDate: null,
          noticeTypes: [],
          openFilter: false,
          reference: null,
          sentBy: null,
          statuses: [],
          toDate: null
        },
        helperText: 'Create a returns invitation, reminder or paper return notice',
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
            sentBy: 'admin-internal@wrls.gov.uk',
            status: 'sent',
            type: 'Reduce alert'
          }
        ],
        pageSubHeading: 'View a notice',
        pageTitle: 'Notices',
        pagination: { currentPageNumber: 1, numberOfPages: 1, showingMessage: 'Showing all 1 notices' }
      })
    })
  })

  describe('when the filters are assessed', () => {
    beforeEach(() => {
      // For the purposes of these tests the results don't matter
      fetchResults = { results: [], total: 0 }
      vi.mock('../../../app/services/notices/fetch-notices.service.js')
      FetchNoticesService.mockResolvedValue(fetchResults)
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub = YarStub()
        yarStub.get.mockReturnValue(null)
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexNoticesService(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub = YarStub()
        yarStub.get.mockReturnValue(_noticeFilters())
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexNoticesService(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _noticeFilters()

        filters.sentBy = 'carol.shaw@wrls.gov.uk'
        yarStub = YarStub()
        yarStub.get.mockReturnValue(filters)
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await IndexNoticesService(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(true)
      })
    })
  })
})

function _noticeFilters() {
  return {
    fromDate: null,
    noticeTypes: [],
    openFilter: false,
    reference: null,
    sentBy: null,
    statuses: [],
    toDate: null
  }
}

// function _noticeFilters() {
//   return {
//     noticeTypes: [],
//     reference: null,
//     sentBy: null,
//     sentFromDay: null,
//     sentFromMonth: null,
//     sentFromYear: null,
//     sentToDay: null,
//     sentToMonth: null,
//     sentToYear: null,
//     statuses: []
//   }
// }
