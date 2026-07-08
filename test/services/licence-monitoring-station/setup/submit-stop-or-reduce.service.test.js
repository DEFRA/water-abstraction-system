// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitStopOrReduceService from '../../../../app/services/licence-monitoring-station/setup/submit-stop-or-reduce.service.js'

describe('Licence Monitoring Station Setup - Stop Or Reduce service', () => {
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
        payload = { stopOrReduce: 'stop' }
      })

      it('saves the submitted option', async () => {
        await SubmitStopOrReduceService(session.id, payload)

        expect(session.stopOrReduce).toEqual('stop')
        expect(session.reduceAtThreshold).toEqual(null)
        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitStopOrReduceService(session.id, payload)

          expect(result).toEqual({
            checkPageVisited: undefined
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          sessionData = { ...sessionData, checkPageVisited: true }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitStopOrReduceService(session.id, payload)

          expect(result).toEqual({
            checkPageVisited: true
          })
          expect(session.$update).toHaveBeenCalled()
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStopOrReduceService(session.id, payload)

        expect(result).toMatchObject({
          backLink: `/system/licence-monitoring-station/setup/${session.id}/threshold-and-unit`,
          monitoringStationLabel: 'Monitoring Station Label',
          pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
          stopOrReduce: null,
          reduceAtThreshold: null
        })
      })

      describe('because the user has not entered or selected anything', () => {
        it('includes an error for both input elements and radio elements', async () => {
          const result = await SubmitStopOrReduceService(session.id, payload)

          expect(result.error).toEqual({
            message: 'Select if the licence holder needs to stop or reduce',
            stopOrReduceRadioElement: {
              text: 'Select if the licence holder needs to stop or reduce'
            },
            reduceAtThresholdRadioElement: null
          })
        })
      })

      describe('because the user has not entered the "reduceAtThreshold"', () => {
        beforeEach(() => {
          payload = {
            stopOrReduce: 'reduce'
          }
        })

        it('includes an error for the reduceAtThreshold input elements', async () => {
          const result = await SubmitStopOrReduceService(session.id, payload)

          expect(result.error).toEqual({
            message: 'Select if the licence holder needs to stop abstraction when they reach a certain amount',
            stopOrReduceRadioElement: null,
            reduceAtThresholdRadioElement: {
              text: 'Select if the licence holder needs to stop abstraction when they reach a certain amount'
            }
          })
        })
      })
    })
  })
})
