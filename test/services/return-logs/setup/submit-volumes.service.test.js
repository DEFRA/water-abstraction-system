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
const SubmitVolumesService = require('../../../../app/services/return-logs/setup/submit-volumes.service.js')

describe('Return Logs Setup - Submit Volumes service', () => {
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
            quantity: 100,
            startDate: '2023-04-01T00:00:00.000Z'
          },
          {
            endDate: '2023-05-31T00:00:00.000Z',
            startDate: '2023-05-01T00:00:00.000Z'
          },
          {
            endDate: '2023-06-30T00:00:00.000Z',
            quantity: 300,
            startDate: '2023-06-01T00:00:00.000Z'
          }
        ],
        returnsFrequency: 'month',
        returnReference: '1234',
        units: 'cubic-metres'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and no volumes have been entered', () => {
        beforeEach(() => {
          payload = {}
          yearMonth = '2023-4' // May 2023
        })

        it('saves the volume for May as null', async () => {
          await SubmitVolumesService.go(session.id, payload, yarStub, yearMonth)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines).to.equal([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              quantity: 100,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              quantity: null,
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              quantity: 300,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ])
        })

        it('sets the notification message title to "Updated" and the text to "Volumes have been updated" ', async () => {
          await SubmitVolumesService.go(session.id, payload, yarStub, yearMonth)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Volumes have been updated' })
        })
      })

      describe('and a volume has been entered', () => {
        beforeEach(() => {
          payload = { '2023-06-30T00:00:00.000Z': '200' }
          yearMonth = '2023-5' // June 2023
        })

        it('saves the volume for June as 200', async () => {
          await SubmitVolumesService.go(session.id, payload, yarStub, yearMonth)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines).to.equal([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              quantity: 100,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              quantity: 200,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ])
        })

        it('sets the notification message title to "Updated" and the text to "Volumes have been updated" ', async () => {
          await SubmitVolumesService.go(session.id, payload, yarStub, yearMonth)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Volumes have been updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = { '2023-04-30T00:00:00.000Z': 'INVALID' }
        yearMonth = '2023-3' // April 2023
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitVolumesService.go(session.id, payload, yarStub, yearMonth)

        expect(result).to.equal({
          activeNavBar: 'search',
          error: [
            {
              href: '#2023-04-30T00:00:00.000Z',
              text: 'Volume must be a number or blank'
            }
          ],
          backLink: `/system/return-logs/setup/${session.id}/check`,
          inputLines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              error: 'Volume must be a number or blank',
              label: 'April 2023',
              quantity: 'INVALID'
            }
          ],
          pageTitle: 'Water abstracted April 2023',
          returnReference: '1234',
          units: 'Cubic metres'
        })
      })

      describe('because the user has not entered a number', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitVolumesService.go(session.id, payload, yarStub, yearMonth)

          expect(result.error).to.equal([
            {
              href: '#2023-04-30T00:00:00.000Z',
              text: 'Volume must be a number or blank'
            }
          ])
        })
      })
    })
  })
})
