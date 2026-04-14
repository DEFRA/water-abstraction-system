'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitManualService = require('../../../app/services/address/submit-manual.service.js')

describe('Address - Submit Manual Service', () => {
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
        address: { postcode: 'SW1A 1AA' },
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
        payload = {
          addressLine1: 'Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        }
      })

      it('saves the submitted address and returns the specified redirect URL', async () => {
        const result = await SubmitManualService.go(sessionId, payload)

        expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

        expect(session.addressJourney.address).to.equal({
          addressLine1: 'Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        })
        expect(session.addressJourney.backUrl).to.equal(`/system/address/${session.id}/manual`)
        expect(session.$update.called).to.be.true()
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not entered anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitManualService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              addressLine1: { text: 'Enter address line 1' },
              errorList: [
                {
                  href: '#addressLine1',
                  text: 'Enter address line 1'
                },
                {
                  href: '#postcode',
                  text: 'Enter a UK postcode'
                }
              ],
              postcode: { text: 'Enter a UK postcode' }
            },
            activeNavBar: 'manage',
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            addressLine4: null,
            backLink: {
              href: `/system/address/${sessionId}/postcode`,
              text: 'Back'
            },
            pageTitle: 'Enter the address',
            pageTitleCaption: null,
            postcode: null
          })
        })
      })

      describe('because the user entered an invalid postcode', () => {
        beforeEach(() => {
          payload = { addressLine1: 'Fake farm', postcode: 'foo' }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitManualService.go(sessionId, payload)

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
            addressLine1: 'Fake farm',
            addressLine2: null,
            addressLine3: null,
            addressLine4: null,
            backLink: {
              href: `/system/address/${sessionId}/postcode`,
              text: 'Back'
            },
            pageTitle: 'Enter the address',
            pageTitleCaption: null,
            postcode: 'foo'
          })
        })
      })
    })
  })
})
