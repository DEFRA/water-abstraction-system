'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')

// Thing under test
const IndexNoticesPresenter = require('../../../app/presenters/notices/index-notices.presenter.js')

describe('Notices - Index Notices presenter', () => {
  let notice
  let notices
  let numberOfPages
  let selectedPage

  beforeEach(() => {
    notices = NoticesFixture.notices()
    numberOfPages = 1
    selectedPage = 1
  })

  it('correctly presents the data', () => {
    const result = IndexNoticesPresenter.go(notices, notices.length, selectedPage, numberOfPages)

    expect(result).to.equal({
      notices: [
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[0].id}`,
          recipients: notices[0].recipientCount,
          reference: notices[0].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Reduce alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[1].id}`,
          recipients: notices[1].recipientCount,
          reference: notices[1].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Resume alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[2].id}`,
          recipients: notices[2].recipientCount,
          reference: notices[2].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Stop alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[3].id}`,
          recipients: notices[3].recipientCount,
          reference: notices[3].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Warning alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[4].id}`,
          recipients: notices[4].recipientCount,
          reference: notices[4].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'HOF warning'
        },
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[5].id}`,
          recipients: notices[5].recipientCount,
          reference: notices[5].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Returns invitation'
        },
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[6].id}`,
          recipients: notices[6].recipientCount,
          reference: notices[6].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Paper return'
        },
        {
          createdDate: '25 March 2025',
          link: `/notifications/report/${notices[7].id}`,
          recipients: notices[7].recipientCount,
          reference: notices[7].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Returns reminder'
        }
      ],
      numberShowing: notices.length,
      pageTitle: 'Notices',
      totalNumber: notices.length.toString()
    })
  })

  describe('the "notices" property', () => {
    describe('the "status" property', () => {
      describe('when the notice has no errors', () => {
        beforeEach(() => {
          notice = notices[0]
        })

        it('returns "sent"', () => {
          const result = IndexNoticesPresenter.go([notice], 1, selectedPage, numberOfPages)

          expect(result.notices[0].status).to.equal('sent')
        })
      })

      describe('when the notice has errors', () => {
        beforeEach(() => {
          notice = notices[0]
          notice.errorCount = 1
        })

        it('returns "error"', () => {
          const result = IndexNoticesPresenter.go([notice], 1, selectedPage, numberOfPages)

          expect(result.notices[0].status).to.equal('error')
        })
      })
    })
  })

  describe('the ""pageTitle" property', () => {
    describe('when there is only one page of results', () => {
      it('the "pageTitle" without page info', () => {
        const result = IndexNoticesPresenter.go(notices, notices.length, selectedPage, numberOfPages)

        expect(result.pageTitle).to.equal('Notices')
      })
    })

    describe('when there are multiple pages of results', () => {
      beforeEach(() => {
        numberOfPages = 3
      })

      it('the "pageTitle" with page info', () => {
        const result = IndexNoticesPresenter.go(notices, notices.length, selectedPage, numberOfPages)

        expect(result.pageTitle).to.equal('Notices (page 1 of 3)')
      })
    })
  })
})
