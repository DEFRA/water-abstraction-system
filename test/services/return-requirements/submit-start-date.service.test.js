'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitStartDateService = require('../../../app/services/return-requirements/submit-start-date.service.js')

describe('Submit Start Date service', () => {
  let payload
  let session

  beforeEach(async () => {
    await DatabaseHelper.clean()

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
        journey: 'returns-required'
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          'start-date-options': 'anotherStartDate',
          'start-date-day': '26',
          'start-date-month': '11',
          'start-date-year': '2023'
        }
      })

      it('fetches the current setup session record', async () => {
        const result = await SubmitStartDateService.go(session.id, payload)

        expect(result.id).to.equal(session.id)
      })

      it('returns page data for the view', async () => {
        const result = await SubmitStartDateService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          error: null,
          journey: 'returns-required',
          pageTitle: 'Select the start date for the return requirement',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licenceVersionStartDate: '1 January 2023',
          anotherStartDateDay: '26',
          anotherStartDateMonth: '11',
          anotherStartDateYear: '2023',
          anotherStartDateSelected: true,
          licenceStartDateSelected: false
        }, { skip: ['id'] })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            journey: 'returns-required',
            pageTitle: 'Select the start date for the return requirement',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            licenceVersionStartDate: '1 January 2023',
            anotherStartDateDay: null,
            anotherStartDateMonth: null,
            anotherStartDateYear: null,
            anotherStartDateSelected: false,
            licenceStartDateSelected: false
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the radio form element', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result.error).to.equal({
            message: 'Select the start date for the return requirement',
            radioFormElement: { text: 'Select the start date for the return requirement' },
            dateInputFormElement: null
          })
        })
      })

      describe('because the user has entered invalid data', () => {
        beforeEach(() => {
          payload = {
            'start-date-options': 'anotherStartDate',
            'start-date-day': 'a',
            'start-date-month': 'b',
            'start-date-year': 'c'
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            journey: 'returns-required',
            pageTitle: 'Select the start date for the return requirement',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            licenceVersionStartDate: '1 January 2023',
            anotherStartDateDay: 'a',
            anotherStartDateMonth: 'b',
            anotherStartDateYear: 'c',
            anotherStartDateSelected: true,
            licenceStartDateSelected: false
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the date input form element', async () => {
          const result = await SubmitStartDateService.go(session.id, payload)

          expect(result.error).to.equal({
            message: 'Enter a real start date',
            radioFormElement: null,
            dateInputFormElement: { text: 'Enter a real start date' }
          })
        })
      })
    })
  })
})
