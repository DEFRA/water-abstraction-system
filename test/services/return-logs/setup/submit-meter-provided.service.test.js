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
const SubmitMeterProvidedService = require('../../../../app/services/return-logs/setup/submit-meter-provided.service.js')

describe('Return Logs Setup - Submit Meter Provided service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      returnReference: '12345',
      reported: 'abstractionVolumes'
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
        payload = { meterProvided: 'yes' }
      })

      it('saves the submitted option', async () => {
        await SubmitMeterProvidedService.go(session.id, payload, yarStub)

        expect(session.meterProvided).to.equal('yes')
        expect(session.$update.called).to.be.true()
      })

      describe('and the user has selected "yes" to a meter being provided', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitMeterProvidedService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: undefined,
            meterProvided: 'yes',
            reported: 'abstractionVolumes'
          })
        })
      })

      describe('and the user has selected "no" to a meter being provided', () => {
        beforeEach(() => {
          payload = { meterProvided: 'no' }
        })

        describe('and the page has been not been visited', () => {
          it('returns the correct details the controller needs to redirect the journey', async () => {
            const result = await SubmitMeterProvidedService.go(session.id, payload, yarStub)

            expect(result).to.equal({
              checkPageVisited: undefined,
              meterProvided: 'no',
              reported: 'abstractionVolumes'
            })
          })

          describe('and meter details had previously been saved to the session', () => {
            beforeEach(() => {
              payload = { meterProvided: 'no' }
              sessionData = {
                data: {
                  meterProvided: 'yes',
                  meterMake: 'Test Meter Make',
                  meterSerialNumber: 'TEST-9876543',
                  meter10TimesDisplay: 'no',
                  returnReference: '12345',
                  reported: 'abstractionVolumes'
                }
              }

              session = SessionModelStub.build(Sinon, sessionData)

              fetchSessionStub.resolves(session)
            })

            it('removes the previously entered meter details from the session data', async () => {
              await SubmitMeterProvidedService.go(session.id, payload, yarStub)

              expect(session.meterProvided).to.equal('no')
              expect(session.meterMake).to.be.null()
              expect(session.meterSerialNumber).to.be.null()
              expect(session.meter10TimesDisplay).to.be.null()
              expect(session.$update.called).to.be.true()
            })
          })
        })

        describe('and the page has been been visited', () => {
          beforeEach(() => {
            session = SessionModelStub.build(Sinon, {
              ...sessionData,
              checkPageVisited: true
            })

            fetchSessionStub.resolves(session)
          })

          it('returns the correct details the controller needs to redirect the journey', async () => {
            const result = await SubmitMeterProvidedService.go(session.id, payload, yarStub)

            expect(result).to.equal({ checkPageVisited: true, meterProvided: 'no', reported: 'abstractionVolumes' })
          })

          it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
            await SubmitMeterProvidedService.go(session.id, payload, yarStub)

            const [flashType, notification] = yarStub.flash.args[0]

            expect(flashType).to.equal('notification')
            expect(notification).to.equal({ titleText: 'Updated', text: 'Reporting details changed' })
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMeterProvidedService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            backLink: { href: `/system/return-logs/setup/${session.id}/units`, text: 'Back' },
            meterProvided: null,
            pageTitle: 'Have meter details been provided?',
            pageTitleCaption: 'Return reference 12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitMeterProvidedService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#meterProvided',
                text: 'Select if meter details have been provided'
              }
            ],
            meterProvided: { text: 'Select if meter details have been provided' }
          })
        })
      })
    })
  })
})
