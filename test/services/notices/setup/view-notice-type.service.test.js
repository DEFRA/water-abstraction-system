'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewNoticeTypeService = require('../../../../app/services/notices/setup/view-notice-type.service.js')

describe('Notices - Setup - View Notice Type service', () => {
  let auth
  let session
  let sessionData

  beforeEach(() => {
    auth = {
      credentials: { scope: ['bulk_return_notifications', 'renewal_notifications'] }
    }

    sessionData = {
      journey: 'adhoc'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewNoticeTypeService(session.id, auth)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices`,
          text: 'Back'
        },
        options: [
          {
            checked: false,
            text: 'Paper return',
            value: 'paperReturn'
          },
          {
            checked: false,
            text: 'Renewals invitation',
            value: 'renewalInvitations'
          },
          {
            checked: false,
            text: 'Returns invitation',
            value: 'invitations'
          },
          {
            checked: false,
            text: 'Returns reminder',
            value: 'reminders'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })
  })
})
