// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../support/stubs/session.stub.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchSessionDal from '../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitPostcodeService from '../../../app/services/address/submit-postcode.service.js'

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

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { postcode: 'SW1A 1AA' }
      })

      it('saves the submitted postcode and returns an empty object (tells controller to redirect to next page)', async () => {
        const result = await SubmitPostcodeService(sessionId, payload)

        expect(result).toEqual({})

        expect(session.addressJourney.address.postcode).toEqual('SW1A 1AA')
        expect(session.$update).toHaveBeenCalled()
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not entered anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitPostcodeService(sessionId, payload)

          expect(result).toEqual({
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
          const result = await SubmitPostcodeService(sessionId, payload)

          expect(result).toEqual({
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
