'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const SessionModelStub = require('../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitPostcodeService = require('../../../app/services/address/submit-postcode.service.js')

describe('Address - Submit Postcode Service', () => {
  let payload
  let session
  let sessionData
  let sessionId

  beforeEach(() => {
    sessionId = generateUUID()

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
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { postcode: 'SW1A 1AA' }
      })

      it('saves the submitted postcode and returns an empty object (tells controller to redirect to next page)', async () => {
        const result = await SubmitPostcodeService.go(sessionId, payload)

        expect(result).to.equal({})

        expect(session.addressJourney.address.postcode).to.equal('SW1A 1AA')
        expect(session.$update.called).to.be.true()
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not entered anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitPostcodeService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              errorList: [
                {
                  href: '#postcode',
                  text: 'Enter a UK postcode'
                }
              ],
              postcode: { text: 'Enter a UK postcode' }
            },
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

      describe('because the user entered an invalid postcode', () => {
        beforeEach(() => {
          payload = { postcode: 'foo' }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitPostcodeService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              errorList: [
                {
                  href: '#postcode',
                  text: 'Enter a valid UK postcode'
                }
              ],
              postcode: { text: 'Enter a valid UK postcode' }
            },
            activeNavBar: 'manage',
            backLink: {
              href: `/system/notices/setup/${sessionId}/contact-type`,
              text: 'Back'
            },
            internationalLink: `/system/address/${sessionId}/international`,
            pageTitle: 'Enter a UK postcode',
            pageTitleCaption: null,
            postcode: 'foo'
          })
        })
      })
    })
  })
})
