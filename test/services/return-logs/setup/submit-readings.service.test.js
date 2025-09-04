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
const SubmitReadingsService = require('../../../../app/services/return-logs/setup/submit-readings.service.js')

describe('Return Logs Setup - Submit Readings service', () => {
  let payload
  let session
  let sessionData
  let yarStub
  let yearMonth

  beforeEach(async () => {
    sessionData = {
      data: {
        lines: [
          {
            endDate: '2023-04-30T00:00:00.000Z',
            reading: 100,
            startDate: '2023-04-01T00:00:00.000Z'
          },
          {
            endDate: '2023-05-31T00:00:00.000Z',
            startDate: '2023-05-01T00:00:00.000Z'
          },
          {
            endDate: '2023-06-30T00:00:00.000Z',
            reading: 300,
            startDate: '2023-06-01T00:00:00.000Z'
          }
        ],
        returnsFrequency: 'month',
        returnReference: '1234'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and no readings have been entered', () => {
        beforeEach(() => {
          payload = {}
          yearMonth = '2023-4' // May 2023
        })

        it('saves the reading for May as null', async () => {
          await SubmitReadingsService.go(session.id, payload, yarStub, yearMonth)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines).to.equal([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              reading: 100,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              reading: null,
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              reading: 300,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ])
        })

        it('sets the notification message title to "Updated" and the text to "Readings have been updated" ', async () => {
          await SubmitReadingsService.go(session.id, payload, yarStub, yearMonth)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', titleText: 'Updated', text: 'Readings have been updated' })
        })
      })

      describe('and a reading has been entered', () => {
        beforeEach(() => {
          payload = { '2023-06-30T00:00:00.000Z': '200' }
          yearMonth = '2023-5' // June 2023
        })

        it('saves the reading for June as 200', async () => {
          await SubmitReadingsService.go(session.id, payload, yarStub, yearMonth)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines).to.equal([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              reading: 100,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              reading: 200,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ])
        })

        it('sets the notification message title to "Updated" and the text to "Readings have been updated" ', async () => {
          await SubmitReadingsService.go(session.id, payload, yarStub, yearMonth)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', titleText: 'Updated', text: 'Readings have been updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = { '2023-04-30T00:00:00.000Z': 'INVALID' }
        yearMonth = '2023-3' // April 2023
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitReadingsService.go(session.id, payload, yarStub, yearMonth)

        expect(result).to.equal({
          activeNavBar: 'search',
          error: [
            {
              href: '#2023-04-30T00:00:00.000Z',
              text: 'Reading must be a number or blank'
            }
          ],
          backLink: `/system/return-logs/setup/${session.id}/check`,
          inputLines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              error: 'Reading must be a number or blank',
              label: 'April 2023',
              reading: 'INVALID'
            }
          ],
          pageTitle: 'Water abstracted April 2023',
          returnReference: '1234'
        })
      })

      describe('because the user has not entered a number', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitReadingsService.go(session.id, payload, yarStub, yearMonth)

          expect(result.error).to.equal([
            {
              href: '#2023-04-30T00:00:00.000Z',
              text: 'Reading must be a number or blank'
            }
          ])
        })
      })
    })
  })
})
