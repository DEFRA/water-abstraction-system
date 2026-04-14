'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { countryLookup } = require('../../../app/presenters/address/base-address.presenter.js')
const SessionModelStub = require('../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitInternationalService = require('../../../app/services/address/submit-international.service.js')

describe('Address - Submit International Service', () => {
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
        payload = {
          addressLine1: 'Falsches Unternehmen',
          addressLine2: '1 Fake-Straße',
          addressLine3: 'Falsches Dorf',
          addressLine4: 'Falsche Stadt',
          country: 'Germany',
          postcode: '80802'
        }
      })

      it('saves the submitted address and returns the specified redirect URL', async () => {
        const result = await SubmitInternationalService.go(sessionId, payload)

        expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

        expect(session.addressJourney.address).to.equal({
          addressLine1: 'Falsches Unternehmen',
          addressLine2: '1 Fake-Straße',
          addressLine3: 'Falsches Dorf',
          addressLine4: 'Falsche Stadt',
          country: 'Germany',
          postcode: '80802'
        })
        expect(session.addressJourney.backUrl).to.equal(`/system/address/${session.id}/international`)
        expect(session.$update.called).to.be.true()
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not entered anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitInternationalService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              addressLine1: { text: 'Enter address line 1' },
              country: { text: 'Select a country' },
              errorList: [
                {
                  href: '#addressLine1',
                  text: 'Enter address line 1'
                },
                {
                  href: '#country',
                  text: 'Select a country'
                }
              ]
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
            country: countryLookup(),
            pageTitle: 'Enter the international address',
            pageTitleCaption: null,
            postcode: null
          })
        })
      })

      describe('because the user did not select a country', () => {
        beforeEach(() => {
          payload = { addressLine1: 'Falsches Unternehmen' }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitInternationalService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              country: { text: 'Select a country' },
              errorList: [
                {
                  href: '#country',
                  text: 'Select a country'
                }
              ]
            },
            activeNavBar: 'manage',
            addressLine1: 'Falsches Unternehmen',
            addressLine2: null,
            addressLine3: null,
            addressLine4: null,
            backLink: {
              href: `/system/address/${sessionId}/postcode`,
              text: 'Back'
            },
            country: countryLookup(),
            pageTitle: 'Enter the international address',
            pageTitleCaption: null,
            postcode: null
          })
        })
      })
    })
  })
})
