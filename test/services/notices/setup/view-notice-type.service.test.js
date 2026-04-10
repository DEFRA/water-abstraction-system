'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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

  beforeEach(async () => {
    auth = {
      credentials: { scope: ['bulk_return_notifications'] }
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
      const result = await ViewNoticeTypeService.go(session.id, auth)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/licence`,
          text: 'Back'
        },
        options: [
          {
            checked: false,
            text: 'Returns invitation',
            value: 'invitations'
          },
          {
            checked: false,
            text: 'Returns reminder',
            value: 'reminders'
          },
          {
            checked: false,
            text: 'Paper return',
            value: 'paperReturn'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })
  })
})
