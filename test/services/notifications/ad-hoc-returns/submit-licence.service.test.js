'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const SubmitLicenceService = require('../../../../app/services/notifications/ad-hoc-returns/submit-licence.service.js')

describe('Ad-hoc Returns Licence service', () => {
  let payload
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: {} })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      before(async () => {
        await LicenceHelper.add({ licenceRef: '01/111' })
        await ReturnLogHelper.add({ licenceRef: '01/111' })

        payload = {
          licenceRef: '01/111'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitLicenceService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRef).to.equal('01/111')
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitLicenceService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not inputted anything', () => {
        before(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'manage',
            sessionId: session.id,
            licenceRef: null,
            error: {
              text: 'Enter a licence number'
            },
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that does not exist', () => {
        before(() => {
          payload = {
            licenceRef: '1111'
          }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'manage',
            sessionId: session.id,
            licenceRef: null,
            error: {
              text: 'Enter a licence number'
            },
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that has no due returns', () => {
        before(async () => {
          await LicenceHelper.add({ licenceRef: '01/145' })

          payload = {
            licenceRef: '01/145'
          }
        })

        it('returns page data needed to re-render the view including the notification message', async () => {
          const result = await SubmitLicenceService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'manage',
            sessionId: session.id,
            licenceRef: null,
            notification: 'There are no returns due for licence 01/145',
            pageTitle: 'Enter a licence number'
          })
        })
      })
    })
  })
})
