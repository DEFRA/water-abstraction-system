// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitThresholdAndUnitService from '../../../../src/services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js'

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
        payload = { 'threshold-Ml/d': '1000', unit: 'Ml/d' }
      })

      it('saves the submitted option', async () => {
        await SubmitThresholdAndUnitService(session.id, payload)

        expect(session.threshold).toEqual(1000)
        expect(session.unit).toEqual('Ml/d')
        expect(session.$update).toHaveBeenCalled()
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
            { checked: false, hint: { text: 'megalitres per day' }, text: 'Ml/d', value: 'Ml/d' },
            { checked: false, hint: { text: 'cubic metres per second' }, text: 'm3/s', value: 'm3/s' },
            { checked: false, hint: { text: 'cubic metres per day' }, text: 'm3/d', value: 'm3/d' },
            { checked: false, hint: { text: 'litres per second' }, text: 'l/s', value: 'l/s' },
            { checked: false, hint: { text: 'metres above ordnance datum' }, text: 'mAOD', value: 'mAOD' },
            { checked: false, hint: { text: 'metres below ordnance datum' }, text: 'mBOD', value: 'mBOD' },
            { checked: false, hint: { text: 'metres above sea datum' }, text: 'mASD', value: 'mASD' },
            { checked: false, hint: { text: 'metres' }, text: 'm', value: 'm' },
            { checked: false, hint: { text: 'south level datum' }, text: 'SLD', value: 'SLD' },
            { checked: false, hint: { text: 'cubic foot per second' }, text: 'ft3/s', value: 'ft3/s' },
            { checked: false, hint: { text: 'gallons per day' }, text: 'gpd', value: 'gpd' },
            { checked: false, hint: { text: 'million gallons per day' }, text: 'Mgpd', value: 'Mgpd' }
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
