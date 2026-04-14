'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../app/dal/fetch-session.dal.js')

// Thing under test
const PostcodeService = require('../../../app/services/address/postcode.service.js')

describe('Address - Postcode Service', () => {
  const sessionId = 'dba48385-9fc8-454b-8ec8-3832d3b9e323'

  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      id: sessionId,
      addressJourney: {
        activeNavBar: 'manage',
        address: {},
        backLink: {
          href: `/system/notices/setup/${sessionId}/contact-type`,
          text: 'Back'
        },
        redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
      }
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await PostcodeService.go(sessionId)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: {
          href: `/system/notices/setup/${sessionId}/contact-type`,
          text: 'Back'
        },
        internationalLink: `/system/address/${sessionId}/international`,
        pageTitle: 'Enter a UK postcode',
        pageTitleCaption: null,
        postcode: null
      })
    })
  })
})
