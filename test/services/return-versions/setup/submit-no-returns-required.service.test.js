'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitNoReturnsRequiredService = require('../../../../app/services/return-versions/setup/submit-no-returns-required.service.js')

describe('Return Versions Setup - Submit No Returns Required service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      data: {
        checkPageVisited: false,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          returnVersions: [
            {
              id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
              startDate: '2023-01-01T00:00:00.000Z',
              reason: null,
              modLogs: []
            }
          ],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'no-returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = {
          reason: 'abstraction-below-100-cubic-metres-per-day'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitNoReturnsRequiredService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.reason).to.equal('abstraction-below-100-cubic-metres-per-day')
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitNoReturnsRequiredService.go(session.id, payload, yarStub)

        expect(result).to.equal({ checkPageVisited: false, journey: 'no-returns-required' })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitNoReturnsRequiredService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true,
            journey: 'no-returns-required'
          })
        })

        it('sets the notification message title to "Updated" and the text to "Return version updated" ', async () => {
          await SubmitNoReturnsRequiredService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Return version updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            pageTitle: 'Why are no returns required?',
            pageTitleCaption: 'Licence 01/ABC',
            backLink: `/system/return-versions/setup/${session.id}/start-date`,
            licenceRef: '01/ABC',
            reason: null
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select the reason for no returns required'
          })
        })
      })
    })
  })
})
