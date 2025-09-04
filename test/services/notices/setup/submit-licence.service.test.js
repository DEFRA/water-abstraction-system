'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const SubmitLicenceService = require('../../../../app/services/notices/setup/submit-licence.service.js')

describe('Notices - Setup - Submit Licence service', () => {
  let clock
  let licenceRef
  let payload
  let session
  let yarStub

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    session = await SessionHelper.add({ data: {} })

    clock = Sinon.useFakeTimers(new Date('2020-06-06'))

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        await LicenceHelper.add({ licenceRef })
        await ReturnLogHelper.add({ licenceRef, endDate: '2020-01-01' })

        payload = {
          licenceRef
        }
      })

      it('saves the submitted value', async () => {
        await SubmitLicenceService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRef).to.equal(licenceRef)
      })

      it('saves the "determinedReturnsPeriod" with the "dueDate" set 28 days from "today"', async () => {
        await SubmitLicenceService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.determinedReturnsPeriod).to.equal({
          dueDate: '2020-07-04T00:00:00.000Z',
          endDate: '2021-03-31T00:00:00.000Z',
          name: 'allYear',
          startDate: '2020-04-01T00:00:00.000Z',
          summer: 'false'
        })
      })

      it('returns the redirect url', async () => {
        const result = await SubmitLicenceService.go(session.id, payload, yarStub)

        expect(result).to.equal({ redirectUrl: 'notice-type' })
      })

      describe('from the check page', () => {
        describe('and the licence ref has been updated', () => {
          beforeEach(async () => {
            session = await SessionHelper.add({ data: { licenceRef: '01/11', checkPageVisited: true } })
          })

          it('redirects to the notice type page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result.redirectUrl).to.equal('notice-type')
          })

          it('updates the sessions "checkPageVisited" flag', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            const refreshedSession = await session.$query()

            expect(refreshedSession.checkPageVisited).to.be.false()
          })

          it('sets a flash message', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            // Check we add the flash message
            const [flashType, bannerMessage] = yarStub.flash.args[0]

            expect(flashType).to.equal('notification')
            expect(bannerMessage).to.equal({
              text: 'Licence number updated',
              title: 'Updated',
              titleText: 'Updated'
            })
          })
        })

        describe('and the licence ref has not been updated', () => {
          beforeEach(async () => {
            session = await SessionHelper.add({ data: { licenceRef, checkPageVisited: true } })
          })

          it('redirects to the check notice type page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result.redirectUrl).to.equal('check-notice-type')
          })

          it('does not set a flash message', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(yarStub.flash.args[0]).to.be.undefined()
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not inputted anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'manage',
            backLink: `/manage`,
            licenceRef: null,
            error: {
              text: 'Enter a licence number'
            },
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that does not exist', () => {
        beforeEach(() => {
          payload = {
            licenceRef: '1111'
          }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'manage',
            backLink: `/manage`,
            licenceRef: '1111',
            error: {
              text: 'Enter a valid licence number'
            },
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that has no due returns', () => {
        beforeEach(async () => {
          await LicenceHelper.add({ licenceRef: '01/145' })

          payload = {
            licenceRef: '01/145'
          }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'manage',
            backLink: `/manage`,
            error: {
              text: 'There are no returns due for licence 01/145'
            },
            licenceRef: '01/145',
            pageTitle: 'Enter a licence number'
          })
        })
      })
    })
  })
})
