'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitMultipleEntriesService = require('../../../../app/services/return-logs/setup/submit-multiple-entries.service.js')

describe('Return Logs Setup - Submit Multiple Entries service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      returnReference: '12345',
      lines: [
        { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
        { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
      ],
      returnsFrequency: 'month',
      reported: 'abstractionVolumes',
      unitSymbol: 'Ml'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { multipleEntries: '100, 200' }
      })

      describe('and the user has previously selected "abstractionVolumes" as the reported type', () => {
        it('saves the submitted option', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          expect(session.lines[0].quantity).to.equal(100)
          expect(session.lines[0].quantityCubicMetres).to.equal(100000)
          expect(session.lines[1].quantity).to.equal(200)
          expect(session.lines[1].quantityCubicMetres).to.equal(200000)
          expect(session.$update.called).to.be.true()
        })

        it('sets the notification message title to "Updated" and the text to "2 monthly volumes have been updated" ', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({
            title: 'Updated',
            text: '2 monthly volumes have been updated'
          })
        })
      })

      describe('and the user has previously selected "meterReadings" as the reported type', () => {
        beforeEach(() => {
          sessionData = {
            returnReference: '12345',
            lines: [
              { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
              { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
            ],
            returnsFrequency: 'month',
            reported: 'meterReadings'
          }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('saves the submitted option', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          expect(session.lines[0].reading).to.equal(100)
          expect(session.lines[1].reading).to.equal(200)
          expect(session.$update.called).to.be.true()
        })

        it('sets the notification message title to "Updated" and the text to "2 monthly meter readings have been updated" ', async () => {
          await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({
            title: 'Updated',
            text: '2 monthly meter readings have been updated'
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            backLink: {
              href: `/system/return-logs/setup/${session.id}/check`,
              text: 'Back'
            },
            endDate: '1 May 2023',
            frequency: 'monthly',
            lineCount: 2,
            measurementType: 'volumes',
            multipleEntries: null,
            pageTitle: 'Enter multiple monthly volumes',
            pageTitleCaption: 'Return reference 12345',
            startDate: '1 April 2023'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not entered anything', () => {
        it('includes an error for the input form element', async () => {
          const result = await SubmitMultipleEntriesService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#multipleEntries',
                text: 'Enter 2 monthly volumes'
              }
            ],
            multipleEntries: {
              text: 'Enter 2 monthly volumes'
            }
          })
        })
      })
    })
  })
})
