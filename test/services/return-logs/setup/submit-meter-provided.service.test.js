// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitMeterProvidedService from '../../../../app/services/return-logs/setup/submit-meter-provided.service.js'

describe('Return Logs Setup - Submit Meter Provided service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      returnReference: '12345',
      reported: 'abstractionVolumes'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { meterProvided: 'yes' }
      })

      it('saves the submitted option', async () => {
        await SubmitMeterProvidedService(session.id, payload, yarStub)

        expect(session.meterProvided).toEqual('yes')
        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the user has selected "yes" to a meter being provided', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitMeterProvidedService(session.id, payload, yarStub)

          expect(result).toEqual({
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
            const result = await SubmitMeterProvidedService(session.id, payload, yarStub)

            expect(result).toEqual({
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

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('removes the previously entered meter details from the session data', async () => {
              await SubmitMeterProvidedService(session.id, payload, yarStub)

              expect(session.meterProvided).toEqual('no')
              expect(session.meterMake).toBeNull()
              expect(session.meterSerialNumber).toBeNull()
              expect(session.meter10TimesDisplay).toBeNull()
              expect(session.$update).toHaveBeenCalled()
            })
          })
        })

        describe('and the page has been been visited', () => {
          beforeEach(() => {
            session = SessionModelStub({
              ...sessionData,
              checkPageVisited: true
            })

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('returns the correct details the controller needs to redirect the journey', async () => {
            const result = await SubmitMeterProvidedService(session.id, payload, yarStub)

            expect(result).toEqual({ checkPageVisited: true, meterProvided: 'no', reported: 'abstractionVolumes' })
          })

          it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
            await SubmitMeterProvidedService(session.id, payload, yarStub)

            const [flashType, notification] = yarStub.flash.mock.calls[0]

            expect(flashType).toEqual('notification')
            expect(notification).toEqual({ titleText: 'Updated', text: 'Reporting details changed' })
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMeterProvidedService(session.id, payload, yarStub)

        expect(result).toMatchObject({
          backLink: { href: `/system/return-logs/setup/${session.id}/units`, text: 'Back' },
          meterProvided: null,
          pageTitle: 'Have meter details been provided?',
          pageTitleCaption: 'Return reference 12345'
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitMeterProvidedService(session.id, payload, yarStub)

          expect(result.error).toEqual({
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
