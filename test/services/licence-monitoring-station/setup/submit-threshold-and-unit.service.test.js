// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitThresholdAndUnitService from '../../../../app/services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js'

describe('Licence Monitoring Station Setup - Threshold and Unit service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      label: 'Monitoring Station Label',
      monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { unit: 'Ml/d', 'threshold-Ml/d': '1000' }
      })

      it('saves the submitted option', async () => {
        await SubmitThresholdAndUnitService(session.id, payload)

        expect(session.threshold).toEqual(1000)
        expect(session.unit).toEqual('Ml/d')
        expect(session.$update.called).toBe(true)
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitThresholdAndUnitService(session.id, payload)

          expect(result).toEqual({
            checkPageVisited: undefined
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          sessionData = { ...sessionData.data, checkPageVisited: true }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitThresholdAndUnitService(session.id, payload)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitThresholdAndUnitService(session.id, payload)

        expect(result).toMatchObject({
          backLink: '/system/monitoring-stations/e1c44f9b-51c2-4aee-a518-5509d6f05869',
          displayUnits: [
            { value: 'Ml/d', text: 'Ml/d', hint: { text: 'megalitres per day' }, checked: false },
            { value: 'm3/s', text: 'm3/s', hint: { text: 'cubic metres per second' }, checked: false },
            { value: 'm3/d', text: 'm3/d', hint: { text: 'cubic metres per day' }, checked: false },
            { value: 'l/s', text: 'l/s', hint: { text: 'litres per second' }, checked: false },
            { value: 'mAOD', text: 'mAOD', hint: { text: 'metres above ordnance datum' }, checked: false },
            { value: 'mBOD', text: 'mBOD', hint: { text: 'metres below ordnance datum' }, checked: false },
            { value: 'mASD', text: 'mASD', hint: { text: 'metres above sea datum' }, checked: false },
            { value: 'm', text: 'm', hint: { text: 'metres' }, checked: false },
            { value: 'SLD', text: 'SLD', hint: { text: 'south level datum' }, checked: false },
            { value: 'ft3/s', text: 'ft3/s', hint: { text: 'cubic foot per second' }, checked: false },
            { value: 'gpd', text: 'gpd', hint: { text: 'gallons per day' }, checked: false },
            { value: 'Mgpd', text: 'Mgpd', hint: { text: 'million gallons per day' }, checked: false }
          ],
          monitoringStationLabel: 'Monitoring Station Label',
          pageTitle: 'What is the licence hands-off flow or level threshold?',
          threshold: null
        })
      })

      describe('because the user has not entered or selected anything', () => {
        it('includes an error for both input elements and radio elements', async () => {
          const result = await SubmitThresholdAndUnitService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [
              { href: '#unit', text: 'Select which units to use' },
              { href: '#threshold', text: 'Enter a threshold' }
            ],
            threshold: { message: 'Enter a threshold' },
            unit: { message: 'Select which units to use' }
          })
        })
      })

      describe('because the user has not entered the "threshold"', () => {
        beforeEach(() => {
          payload = {
            unit: 'Ml/d'
          }
        })

        it('includes an error for the threshold input elements', async () => {
          const result = await SubmitThresholdAndUnitService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [{ href: '#threshold', text: 'Enter a threshold' }],
            threshold: { message: 'Enter a threshold' }
          })
        })
      })
    })
  })
})
