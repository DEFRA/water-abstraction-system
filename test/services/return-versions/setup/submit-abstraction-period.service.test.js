'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitAbstractionPeriodService = require('../../../../app/services/return-versions/setup/submit-abstraction-period.service.js')

describe('Return Versions Setup - Submit Abstraction Period service', () => {
  const requirementIndex = 0

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
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': '01',
          'abstraction-period-start-month': '12',
          'abstraction-period-end-day': '02',
          'abstraction-period-end-month': '7'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].abstractionPeriod).to.equal({
          'abstraction-period-end-day': '02',
          'abstraction-period-start-day': '01',
          'abstraction-period-end-month': '7',
          'abstraction-period-start-month': '12'
        })
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: false
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Requirements for returns updated" ', async () => {
          await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Requirements for returns updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            pageTitle: 'Enter the abstraction period for the requirements for returns',
            abstractionPeriod: null,
            backLink: `/system/return-versions/setup/${session.id}/points/0`,
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for both input elements', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.error).to.equal({
            text: {
              startResult: 'Select the start date of the abstraction period',
              endResult: 'Select the end date of the abstraction period'
            }
          })
        })
      })

      describe('because the user has not submitted a start abstraction period', () => {
        beforeEach(() => {
          payload = {
            'abstraction-period-start-day': null,
            'abstraction-period-start-month': null,
            'abstraction-period-end-day': '02',
            'abstraction-period-end-month': '7'
          }
        })

        it('includes an error for the start date input element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.error).to.equal({
            text: {
              startResult: 'Select the start date of the abstraction period',
              endResult: null
            }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.abstractionPeriod).to.equal({
            'abstraction-period-start-day': null,
            'abstraction-period-start-month': null,
            'abstraction-period-end-day': '02',
            'abstraction-period-end-month': '7'
          })
        })
      })

      describe('because the user has not submitted an end abstraction period', () => {
        beforeEach(() => {
          payload = {
            'abstraction-period-start-day': '08',
            'abstraction-period-start-month': '12',
            'abstraction-period-end-day': null,
            'abstraction-period-end-month': null
          }
        })

        it('includes an error for the end date input element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.error).to.equal({
            text: {
              startResult: null,
              endResult: 'Select the end date of the abstraction period'
            }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.abstractionPeriod).to.equal({
            'abstraction-period-start-day': '08',
            'abstraction-period-start-month': '12',
            'abstraction-period-end-day': null,
            'abstraction-period-end-month': null
          })
        })
      })

      describe('because the user has submitted invalid values', () => {
        beforeEach(() => {
          payload = {
            'abstraction-period-start-day': 'abc',
            'abstraction-period-start-month': '123',
            'abstraction-period-end-day': 'abc',
            'abstraction-period-end-month': '123'
          }
        })

        it('includes an error for both input elements', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.error).to.equal({
            text: {
              startResult: 'Enter a real start date',
              endResult: 'Enter a real end date'
            }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.abstractionPeriod).to.equal({
            'abstraction-period-start-day': 'abc',
            'abstraction-period-start-month': '123',
            'abstraction-period-end-day': 'abc',
            'abstraction-period-end-month': '123'
          })
        })
      })
    })
  })
})
