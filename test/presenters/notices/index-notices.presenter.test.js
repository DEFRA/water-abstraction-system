'use strict'

// Test helpers
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')

// Thing under test
const IndexNoticesPresenter = require('../../../app/presenters/notices/index-notices.presenter.js')

describe('Notices - Index Notices presenter', () => {
  let auth
  let notices

  beforeEach(() => {
    notices = NoticesFixture.mapToFetchNoticesResult(NoticesFixture.notices())

    auth = {
      credentials: { scope: ['bulk_return_notifications'] }
    }
  })

  it('correctly presents the data', () => {
    const result = IndexNoticesPresenter.go(notices, auth)

    expect(result).toEqual({
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
          type: 'Renewals invitation'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[7].id}`,
          recipients: notices[7].recipientCount,
          reference: notices[7].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Returns invitation'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[8].id}`,
          recipients: notices[8].recipientCount,
          reference: notices[8].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Paper return'
        },
        {
          createdDate: '25 March 2025',
          link: `/system/notices/${notices[9].id}`,
          recipients: notices[9].recipientCount,
          reference: notices[9].referenceCode,
          sentBy: 'admin-internal@wrls.gov.uk',
          status: 'sent',
          type: 'Returns reminder'
        }
      ],
      pageSubHeading: 'View a notice',
      pageTitle: 'Notices'
    })
  })

  describe('the "helperText" property', () => {
    describe('when the user has both the "bulk_return_notifications" and "renewal_notifications" roles', () => {
      beforeEach(() => {
        auth.credentials.scope = ['bulk_return_notifications', 'renewal_notifications']
      })

      it('returns the correct helper text', () => {
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.helperText).toEqual(
          'Create a renewals invitation, returns invitation, reminder or paper return notice'
        )
      })
    })

    describe('when the user has only the "bulk_return_notifications" role', () => {
      beforeEach(() => {
        auth.credentials.scope = ['bulk_return_notifications']
      })

      it('returns the correct helper text', () => {
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.helperText).toEqual('Create a returns invitation, reminder or paper return notice')
      })
    })

    describe('when the user has only the "renewal_notifications" role', () => {
      beforeEach(() => {
        auth.credentials.scope = ['renewal_notifications']
      })

      it('returns the correct helper text', () => {
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.helperText).toEqual('Create a renewals invitation')
      })
    })

    describe('when the user has neither role', () => {
      beforeEach(() => {
        auth.credentials.scope = ['returns']
      })

      it('returns null', () => {
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.helperText).toBeNull()
      })
    })
  })

  describe('the "notices" property', () => {
    describe('the "type" property', () => {
      describe('when the notice is for a water abstraction alert', () => {
        it('returns the alert type', () => {
          const results = IndexNoticesPresenter.go(notices, auth)

          expect(results.notices[0].type).toEqual('Reduce alert')
          expect(results.notices[1].type).toEqual('Resume alert')
          expect(results.notices[2].type).toEqual('Stop alert')
          expect(results.notices[3].type).toEqual('Warning alert')
        })
      })

      describe('when the notice is not for a water abstraction alert', () => {
        it('returns the notice type', () => {
          const results = IndexNoticesPresenter.go(notices, auth)

          expect(results.notices[4].type).toEqual('HOF warning')
          expect(results.notices[5].type).toEqual('Renewal')
          expect(results.notices[6].type).toEqual('Renewals invitation')
          expect(results.notices[7].type).toEqual('Returns invitation')
          expect(results.notices[8].type).toEqual('Paper return')
          expect(results.notices[9].type).toEqual('Returns reminder')
        })
      })
    })
  })

  describe('the "links" property', () => {
    describe('when the user has permissions', () => {
      beforeEach(() => {
        auth.credentials.scope = ['bulk_return_notifications', 'renewal_notifications']
      })

      it('returns all of the links', () => {
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.links).toEqual({
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
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.links).toEqual({})
      })
    })

    describe('when the user has the "bulk_return_notifications" permission', () => {
      beforeEach(() => {
        auth.credentials.scope = ['bulk_return_notifications']
      })

      it('returns all of the links', () => {
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.links).toEqual({
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

    describe('when the user has the "renewal_notifications" permission', () => {
      beforeEach(() => {
        auth.credentials.scope = ['renewal_notifications']
      })

      it('returns all of the links', () => {
        const result = IndexNoticesPresenter.go(notices, auth)

        expect(result.links).toEqual({
          adhoc: {
            href: '/system/notices/setup/adhoc',
            text: 'Create an ad-hoc notice'
          }
        })
      })
    })
  })
})
