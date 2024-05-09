'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitStartDateService = require('../../../app/services/return-requirements/submit-start-date.service.js')

describe('Submit Start Date service', () => {
  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        checkYourAnswersVisited: false
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload (licence start date)', () => {
      beforeEach(async () => {
        payload = {
          'start-date-options': 'licenceStartDate'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitStartDateService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.startDateOptions).to.equal('licenceStartDate')
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitStartDateService.go(session.id, payload)

        expect(result).to.equal({ checkYourAnswersVisited: false, journey: 'returns-required' })
      })
    })

    describe('with a valid payload (another start date', () => {
      beforeEach(async () => {
        payload = {
          'start-date-options': 'anotherStartDate',
          'start-date-day': '26',
          'start-date-month': '11',
          'start-date-year': '2023'
        }
      })

      it('saves the submitted values', async () => {
        await SubmitStartDateService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.startDateOptions).to.equal('anotherStartDate')
        expect(refreshedSession.startDateDay).to.equal('26')
        expect(refreshedSession.startDateMonth).to.equal('11')
        expect(refreshedSession.startDateYear).to.equal('2023')
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitStartDateService.go(session.id, payload)

        expect(result).to.equal({ checkYourAnswersVisited: false, journey: 'returns-required' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartDateService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Select the start date for the requirements for returns',
          anotherStartDateDay: null,
          anotherStartDateMonth: null,
          anotherStartDateYear: null,
          backLink: '/licences/8b7f78ba-f3ad-4cb6-a058-78abc4d1383d#charge',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licenceVersionStartDate: '1 January 2023',
          startDateOption: null
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

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
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result.error).to.equal({
            message: 'Enter a real start date',
            radioFormElement: null,
            dateInputFormElement: { text: 'Enter a real start date' }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result.anotherStartDateDay).to.equal('a')
          expect(result.anotherStartDateMonth).to.equal('b')
          expect(result.anotherStartDateYear).to.equal('c')
          expect(result.startDateOption).to.equal('anotherStartDate')
        })
      })
    })
  })
})
