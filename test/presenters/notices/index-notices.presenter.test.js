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
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const IndexNoticesPresenter = require('../../../app/presenters/notices/index-notices.presenter.js')

describe('Notices - Index Notices presenter', () => {
  let auth
  let notices

  beforeEach(() => {
    notices = NoticesFixture.mapToFetchNoticesResult(NoticesFixture.notices())

    auth = {
      credentials: { scope: ['bulk_return_notifications', 'returns'] }
    }
    notices = NoticesFixture.mapToFetchNoticesResult(NoticesFixture.notices())

    Sinon.stub(FeatureFlagsConfig, 'enableAdHocNotifications').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', () => {
    const result = IndexNoticesPresenter.go(notices, notices.length, auth)

    expect(result).to.equal({
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
          link: `/system/notices/${notices[0].id}`,
          recipients: notices[0].recipientCount,
          reference: notices[0].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Reduce alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[1].id}`,
          recipients: notices[1].recipientCount,
          reference: notices[1].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Resume alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[2].id}`,
          recipients: notices[2].recipientCount,
          reference: notices[2].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Stop alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[3].id}`,
          recipients: notices[3].recipientCount,
          reference: notices[3].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Warning alert'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[4].id}`,
          recipients: notices[4].recipientCount,
          reference: notices[4].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'HOF warning'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[5].id}`,
          recipients: notices[5].recipientCount,
          reference: notices[5].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Renewal'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[6].id}`,
          recipients: notices[6].recipientCount,
          reference: notices[6].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Returns invitation'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[7].id}`,
          recipients: notices[7].recipientCount,
          reference: notices[7].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Paper return'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[8].id}`,
          recipients: notices[8].recipientCount,
          reference: notices[8].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Returns reminder'
        }
      ],
      pageSubHeading: 'View a notice',
      pageTitle: 'Notices',
      tableCaption: `Showing all ${notices.length} notices`
    })
  })

  describe('the "notices" property', () => {
    describe('the "type" property', () => {
      describe('when the notice is for a water abstraction alert', () => {
        it('returns the alert type', () => {
          const results = IndexNoticesPresenter.go(notices, notices.length, auth)

          expect(results.notices[0].type).to.equal('Reduce alert')
          expect(results.notices[1].type).to.equal('Resume alert')
          expect(results.notices[2].type).to.equal('Stop alert')
          expect(results.notices[3].type).to.equal('Warning alert')
        })
      })

      describe('when the notice is not for a water abstraction alert', () => {
        it('returns the notice type', () => {
          const results = IndexNoticesPresenter.go(notices, notices.length, auth)

          expect(results.notices[4].type).to.equal('HOF warning')
          expect(results.notices[5].type).to.equal('Renewal')
          expect(results.notices[6].type).to.equal('Returns invitation')
          expect(results.notices[7].type).to.equal('Paper return')
          expect(results.notices[8].type).to.equal('Returns reminder')
        })
      })
    })
  })

  describe('the "tableCaption" property', () => {
    describe('when there is only one page of results', () => {
      it('returns the "tableCaption" with the "Showing all" message', () => {
        const result = IndexNoticesPresenter.go(notices, notices.length, auth)

        expect(result.tableCaption).to.equal(`Showing all ${notices.length} notices`)
      })
    })

    describe('when there are multiple pages of results', () => {
      it('returns the "tableCaption" with the "Showing x of y" message', () => {
        const result = IndexNoticesPresenter.go(notices, 50, auth)

        expect(result.tableCaption).to.equal(`Showing ${notices.length} of 50 notices`)
      })
    })
  })

  describe('the "links" property', () => {
    describe('when the "enableAdHocNotifications" is false', () => {
      beforeEach(() => {
        Sinon.stub(FeatureFlagsConfig, 'enableAdHocNotifications').value(false)

        auth.credentials.scope = ['bulk_return_notifications', 'returns']
      })

      it('returns all of the links (except adhoc)', () => {
        const result = IndexNoticesPresenter.go(notices, 0, auth)

        expect(result.links).to.equal({
          notice: {
            href: '/system/notices/setup/standard',
            text: 'Create a standard notice'
          }
        })
      })
    })

    describe('when the user has both permissions', () => {
      beforeEach(() => {
        auth.credentials.scope = ['bulk_return_notifications', 'returns']
      })

      it('returns all of the links', () => {
        const result = IndexNoticesPresenter.go(notices, 0, auth)

        expect(result.links).to.equal({
          adhoc: {
            href: '/system/notices/setup/adhoc',
            text: 'Create an ad-hoc notice'
          },
          notice: {
            href: '/system/notices/setup/standard',
            text: 'Create a standard notice'
          }
        })
      })
    })

    describe('when the user has no permissions', () => {
      beforeEach(() => {
        auth.credentials.scope = []
      })

      it('returns none of the links', () => {
        const result = IndexNoticesPresenter.go(notices, 0, auth)

        expect(result.links).to.equal({})
      })
    })

    describe('when the user has the "bulk_return_notifications" permission', () => {
      beforeEach(() => {
        auth.credentials.scope = ['bulk_return_notifications']
      })

      it('returns all of the links', () => {
        const result = IndexNoticesPresenter.go(notices, 0, auth)

        expect(result.links).to.equal({
          adhoc: {
            href: '/system/notices/setup/adhoc',
            text: 'Create an ad-hoc notice'
          },
          notice: {
            href: '/system/notices/setup/standard',
            text: 'Create a standard notice'
          }
        })
      })
    })

    describe('when the user has the "returns" permission', () => {
      beforeEach(() => {
        auth.credentials.scope = ['returns']
      })

      it('returns only the "adhoc" link', () => {
        const result = IndexNoticesPresenter.go(notices, 0, auth)

        expect(result.links).to.equal({
          adhoc: {
            href: '/system/notices/setup/adhoc',
            text: 'Create an ad-hoc notice'
          }
        })
      })
    })
  })
})
