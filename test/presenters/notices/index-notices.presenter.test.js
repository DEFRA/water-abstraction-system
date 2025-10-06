'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')

// Things we need to stub
const featureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const IndexNoticesPresenter = require('../../../app/presenters/notices/index-notices.presenter.js')

describe('Notices - Index Notices presenter', () => {
  let notices
  let numberOfPages
  let selectedPage

  beforeEach(() => {
    notices = NoticesFixture.notices()
    numberOfPages = 1
    selectedPage = 1

    Sinon.stub(featureFlagsConfig, 'enableSystemNoticeView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', () => {
    const result = IndexNoticesPresenter.go(notices, notices.length, selectedPage, numberOfPages)

    expect(result).to.equal({
      links: {
        adhoc: {
          href: '/system/notices/setup/adhoc',
          text: 'Create adhoc notice'
        },
        notice: {
          href: '/system/notices/setup/standard',
          text: 'Create notice'
        }
      },
      notices: [
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[0].id}`,
          recipients: notices[0].recipientCount,
          reference: notices[0].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Reduce alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[1].id}`,
          recipients: notices[1].recipientCount,
          reference: notices[1].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Resume alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[2].id}`,
          recipients: notices[2].recipientCount,
          reference: notices[2].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Stop alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[3].id}`,
          recipients: notices[3].recipientCount,
          reference: notices[3].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Warning alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[4].id}`,
          recipients: notices[4].recipientCount,
          reference: notices[4].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'HOF warning'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[5].id}`,
          recipients: notices[5].recipientCount,
          reference: notices[5].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Returns invitation'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[6].id}`,
          recipients: notices[6].recipientCount,
          reference: notices[6].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Paper return'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[7].id}`,
          recipients: notices[7].recipientCount,
          reference: notices[7].referenceCode,
          sentBy: 'billing.data@wrls.gov.uk',
          status: 'sent',
          type: 'Returns reminder'
        }
      ],
      pageTitle: 'Notices',
      tableCaption: `Showing all ${notices.length} notices`
    })
  })

  describe('the "notices" property', () => {
    describe('the "type" property', () => {
      describe('when the notice is for a water abstraction alert', () => {
        it('returns the alert type', () => {
          const results = IndexNoticesPresenter.go(notices, notices.length, selectedPage, numberOfPages)

          expect(results.notices[0].type).to.equal('Reduce alert')
          expect(results.notices[1].type).to.equal('Resume alert')
          expect(results.notices[2].type).to.equal('Stop alert')
          expect(results.notices[3].type).to.equal('Warning alert')
        })
      })

      describe('when the notice is not for a water abstraction alert', () => {
        it('returns the notice type', () => {
          const results = IndexNoticesPresenter.go(notices, notices.length, selectedPage, numberOfPages)

          expect(results.notices[4].type).to.equal('HOF warning')
          expect(results.notices[5].type).to.equal('Returns invitation')
          expect(results.notices[6].type).to.equal('Paper return')
          expect(results.notices[7].type).to.equal('Returns reminder')
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

  describe('the "tableCaption" property', () => {
    describe('when there is only one page of results', () => {
      it('returns the "tableCaption" without page info', () => {
        const result = IndexNoticesPresenter.go(notices, notices.length, selectedPage, numberOfPages)

        expect(result.tableCaption).to.equal(`Showing all ${notices.length} notices`)
      })
    })

    describe('when there are multiple pages of results', () => {
      it('returns the "tableCaption" with page info', () => {
        const result = IndexNoticesPresenter.go(notices, 50, selectedPage, numberOfPages)

        expect(result.tableCaption).to.equal(`Showing ${notices.length} of 50 notices`)
      })
    })
  })
})
