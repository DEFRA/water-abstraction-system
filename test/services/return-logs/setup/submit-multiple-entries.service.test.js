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
const SubmitMultipleEntriesService = require('../../../../app/services/return-logs/setup/submit-multiple-entries.service.js')

describe('Return Logs Setup - Submit Multiple Entries service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345',
        lines: [
          { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
          { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
        ],
        returnsFrequency: 'month',
        reported: 'abstraction-volumes'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { multipleEntries: '100, 200' }
      })

      describe('and the user has previously selected "abstraction-volumes" as the reported type', () => {
        it('saves the submitted option', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines[0].quantity).to.equal(100)
          expect(refreshedSession.lines[1].quantity).to.equal(200)
        })

        it('sets the notification message title to "Updated" and the text to "2 monthly volumes have been updated" ', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: '2 monthly volumes have been updated' })
        })
      })

      describe('and the user has previously selected "meter-readings" as the reported type', () => {
        beforeEach(async () => {
          sessionData = {
            data: {
              returnReference: '12345',
              lines: [
                { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
                { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
              ],
              returnsFrequency: 'month',
              reported: 'meter-readings'
            }
          }

          session = await SessionHelper.add(sessionData)
        })

        it('saves the submitted option', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines[0].reading).to.equal(100)
          expect(refreshedSession.lines[1].reading).to.equal(200)
        })

        it('sets the notification message title to "Updated" and the text to "2 monthly meter readings have been updated" ', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: '2 monthly meter readings have been updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            backLink: `/system/return-logs/setup/${session.id}/check`,
            endDate: '1 May 2023',
            frequency: 'monthly',
            lineCount: 2,
            measurementType: 'volumes',
            multipleEntries: null,
            pageTitle: 'Enter multiple monthly volumes',
            caption: 'Return reference 12345',
            startDate: '1 April 2023'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not entered anything', () => {
        it('includes an error for the input form element', async () => {
          const result = await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({ text: 'Enter 2 monthly volumes' })
        })
      })
    })
  })
})
