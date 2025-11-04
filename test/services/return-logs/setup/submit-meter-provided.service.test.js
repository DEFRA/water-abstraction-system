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
const SubmitMeterProvidedService = require('../../../../app/services/return-logs/setup/submit-meter-provided.service.js')

describe('Return Logs Setup - Submit Meter Provided service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345',
        reported: 'abstractionVolumes'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { meterProvided: 'yes' }
      })

      it('saves the submitted option', async () => {
        await SubmitMeterProvidedService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.meterProvided).to.equal('yes')
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
            beforeEach(async () => {
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

              session = await SessionHelper.add(sessionData)
            })

            it('removes the previously entered meter details from the session data', async () => {
              await SubmitMeterProvidedService.go(session.id, payload, yarStub)

              const refreshedSession = await session.$query()

              expect(refreshedSession.meterProvided).to.equal('no')
              expect(refreshedSession.meterMake).to.be.null()
              expect(refreshedSession.meterSerialNumber).to.be.null()
              expect(refreshedSession.meter10TimesDisplay).to.be.null()
            })
          })
        })

        describe('and the page has been been visited', () => {
          beforeEach(async () => {
            session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
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
            activeNavBar: 'search',
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
