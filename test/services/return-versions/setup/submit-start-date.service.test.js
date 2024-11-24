'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitStartDateService = require('../../../../app/services/return-versions/setup/submit-start-date.service.js')

describe('Return Versions Setup - Submit Start Date service', () => {
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
          currentVersionStartDate: '2023-01-01',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          returnVersions: [
            {
              id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
              startDate: '2023-01-01',
              reason: null,
              modLogs: []
            }
          ],
          startDate: '2022-04-01',
          waterUndertaker: true
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload (licence start date)', () => {
      beforeEach(async () => {
        payload = {
          'start-date-options': 'licenceStartDate'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitStartDateService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.startDateOptions).to.equal('licenceStartDate')
        expect(new Date(refreshedSession.returnVersionStartDate)).to.equal(new Date('2023-01-01'))
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result).to.equal({ checkPageVisited: false, journey: 'returns-required' })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true,
            journey: 'returns-required'
          })
        })

        it('sets the notification message title to "Updated" and the text to "Changes made" ', async () => {
          await SubmitStartDateService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
        })
      })
    })

    describe('with a valid payload (another start date)', () => {
      beforeEach(async () => {
        payload = {
          'start-date-options': 'anotherStartDate',
          'start-date-day': '26',
          'start-date-month': '11',
          'start-date-year': '2023'
        }
      })

      it('saves the submitted values', async () => {
        await SubmitStartDateService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.startDateOptions).to.equal('anotherStartDate')
        expect(refreshedSession.startDateDay).to.equal('26')
        expect(refreshedSession.startDateMonth).to.equal('11')
        expect(refreshedSession.startDateYear).to.equal('2023')
        expect(new Date(refreshedSession.returnVersionStartDate)).to.equal(new Date('2023-11-26'))
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitStartDateService.go(session.id, payload, yarStub)

        expect(result).to.equal({ checkPageVisited: false, journey: 'returns-required' })
      })
    })

    describe('with a valid payload and is for quarterly returns', () => {
      beforeEach(async () => {
        payload = {
          'start-date-options': 'anotherStartDate',
          'start-date-day': '01',
          'start-date-month': '04',
          'start-date-year': '2025'
        }
      })

      it('saves the submitted values', async () => {
        await SubmitStartDateService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.startDateOptions).to.equal('anotherStartDate')
        expect(refreshedSession.startDateDay).to.equal('01')
        expect(refreshedSession.startDateMonth).to.equal('04')
        expect(refreshedSession.startDateYear).to.equal('2025')
        expect(new Date(refreshedSession.returnVersionStartDate)).to.equal(new Date('2025-04-01'))

        expect(refreshedSession.quarterlyReturns).to.be.true()
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitStartDateService.go(session.id, payload, yarStub)

        expect(result).to.equal({ checkPageVisited: false, journey: 'returns-required' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}

        Sinon.stub(FeatureFlagsConfig, 'enableSystemLicenceView').value(true)
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartDateService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            pageTitle: 'Select the start date for the requirements for returns',
            anotherStartDateDay: null,
            anotherStartDateMonth: null,
            anotherStartDateYear: null,
            backLink: '/system/licences/8b7f78ba-f3ad-4cb6-a058-78abc4d1383d/set-up',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            licenceVersionStartDate: '1 January 2023',
            startDateOption: null
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            message: 'Select the start date for the requirements for returns',
            radioFormElement: { text: 'Select the start date for the requirements for returns' },
            dateInputFormElement: null
          })
        })
      })

      describe('because the user has selected another start date and entered invalid data', () => {
        beforeEach(async () => {
          payload = {
            'start-date-options': 'anotherStartDate',
            'start-date-day': 'a',
            'start-date-month': 'b',
            'start-date-year': 'c'
          }
        })

        it('includes an error for the date input element', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            message: 'Enter a real start date',
            radioFormElement: null,
            dateInputFormElement: { text: 'Enter a real start date' }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result.anotherStartDateDay).to.equal('a')
          expect(result.anotherStartDateMonth).to.equal('b')
          expect(result.anotherStartDateYear).to.equal('c')
          expect(result.startDateOption).to.equal('anotherStartDate')
        })
      })
    })
  })
})
