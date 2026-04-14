'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmissionService = require('../../../../app/services/return-logs/setup/submission.service.js')

describe('Return Logs Setup - Submission service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { beenReceived: false, returnReference: '1234' }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SubmissionService.go(session.id)

      expect(result).to.equal({
        backLink: { href: `/system/return-logs/setup/${session.id}/received`, text: 'Back' },
        beenReceived: false,
        journey: null,
        pageTitle: 'What do you want to do with this return?',
        pageTitleCaption: 'Return reference 1234'
      })
    })
  })
})
