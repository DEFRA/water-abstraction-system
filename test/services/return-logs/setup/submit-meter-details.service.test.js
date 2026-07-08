// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitMeterDetailsService from '../../../../app/services/return-logs/setup/submit-meter-details.service.js'

describe('Return Logs Setup - Submit Meter Details service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      returnReference: '12345',
      reported: 'meterReadings'
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
        payload = {
          meterMake: 'WATER',
          meterSerialNumber: '123',
          meter10TimesDisplay: 'yes'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitMeterDetailsService(session.id, payload, yarStub)

        expect(session.meterMake).toEqual('WATER')
        expect(session.meterSerialNumber).toEqual('123')
        expect(session.meter10TimesDisplay).toEqual('yes')

        expect(session.$update).toHaveBeenCalled()
      })
    })

    describe('and the page has been not been visited', () => {
      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitMeterDetailsService(session.id, payload, yarStub)

        expect(result).toEqual({
          checkPageVisited: undefined,
          reported: 'meterReadings'
        })
      })
    })

    describe('and the page has been visited', () => {
      beforeEach(() => {
        session = SessionModelStub({
          ...sessionData,
          checkPageVisited: true
        })

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
        const result = await SubmitMeterDetailsService(session.id, payload, yarStub)

        expect(result).toEqual({
          checkPageVisited: true,
          reported: 'meterReadings'
        })
      })

      it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
        await SubmitMeterDetailsService(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(notification).toEqual({ titleText: 'Updated', text: 'Reporting details changed' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMeterDetailsService(session.id, payload, yarStub)

        expect(result).toMatchObject({
          backLink: { href: `/system/return-logs/setup/${session.id}/meter-provided`, text: 'Back' },
          meterMake: null,
          meterSerialNumber: null,
          meter10TimesDisplay: null,
          pageTitle: 'Meter details',
          pageTitleCaption: 'Return reference 12345'
        })
      })

      describe('because the user has not entered or selected anything', () => {
        it('includes an error for both input elements and radio elements', async () => {
          const result = await SubmitMeterDetailsService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              { href: '#meterMake', text: 'Enter the make of the meter' },
              { href: '#meterSerialNumber', text: 'Enter a serial number' },
              {
                href: '#meter10TimesDisplay',
                text: 'Select if the meter has a ×10 display'
              }
            ],
            meterMake: { text: 'Enter the make of the meter' },
            meterSerialNumber: { text: 'Enter a serial number' },
            meter10TimesDisplay: { text: 'Select if the meter has a ×10 display' }
          })
        })
      })

      describe('because the user has not entered the "make"', () => {
        beforeEach(() => {
          payload = {
            meterSerialNumber: '123',
            meter10TimesDisplay: 'yes'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [{ href: '#meterMake', text: 'Enter the make of the meter' }],
            meterMake: { text: 'Enter the make of the meter' }
          })
        })
      })

      describe('because the user has not entered the "serial number"', () => {
        beforeEach(() => {
          payload = {
            meterMake: 'WATER',
            meter10TimesDisplay: 'yes'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [{ href: '#meterSerialNumber', text: 'Enter a serial number' }],
            meterSerialNumber: { text: 'Enter a serial number' }
          })
        })
      })

      describe('because the user has not selected the "times 10 display"', () => {
        beforeEach(() => {
          payload = {
            meterMake: 'WATER',
            meterSerialNumber: '123'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [{ href: '#meter10TimesDisplay', text: 'Select if the meter has a ×10 display' }],
            meter10TimesDisplay: { text: 'Select if the meter has a ×10 display' }
          })
        })
      })
    })
  })
})
