// Test framework dependencies

// Test helpers
import LicenceMonitoringStationModel from '../../../../app/models/licence-monitoring-station.model.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'

// Thing under test
import SubmitCheckService from '../../../../app/services/licence-monitoring-station/setup/submit-check.service.js'

describe('Licence Monitoring Station Setup - Submit Check Service', () => {
  const userId = 12345
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      unit: 'Ml/d',
      label: 'LABEL',
      licenceId: generateUUID(),
      threshold: 100,
      licenceRef: 'LICENCE_REF',
      conditionId: 'no_condition',
      stopOrReduce: 'stop',
      checkPageVisited: true,
      reduceAtThreshold: null,
      monitoringStationId: generateUUID(),
      conditionDisplayText: 'CONDITION_DISPLAY_TEXT',
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('creates the monitoring station tag', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.monitoringStationId).toBeDefined()
    })

    it('persists the abstraction period', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.abstractionPeriodStartDay).toEqual(sessionData.abstractionPeriodStartDay)
      expect(result.abstractionPeriodStartMonth).toEqual(sessionData.abstractionPeriodStartMonth)
      expect(result.abstractionPeriodEndDay).toEqual(sessionData.abstractionPeriodEndDay)
      expect(result.abstractionPeriodEndMonth).toEqual(sessionData.abstractionPeriodEndMonth)
    })

    it('persists the user that created the tag', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.createdBy).toEqual(userId)
    })

    it('deletes the session', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      expect(DeleteSessionDal.go).toHaveBeenCalledWith(session.id)
    })

    it('continues the journey', async () => {
      const result = await SubmitCheckService(session.id, userId, yarStub)

      expect(result).toEqual(sessionData.monitoringStationId)
    })

    it('sets the notification message title to "Success" and the text to "Tag for licence ... added" ', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      const [flashType, notification] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({
        titleText: 'Success',
        text: `Tag for licence ${session.licenceRef} added`
      })
    })

    describe('and the session unit is a flow unit', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, unit: 'm3/s' }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('sets "measureType" as "flow"', async () => {
        await SubmitCheckService(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.measureType).toEqual('flow')
      })
    })

    describe('and the session unit is a level unit', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, unit: 'mAOD' }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('sets "measureType" as "level"', async () => {
        await SubmitCheckService(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.measureType).toEqual('level')
      })
    })

    describe('and "stopOrReduce" is "stop"', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, stopOrReduce: 'stop' }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('sets "restrictionType" as "stop"', async () => {
        await SubmitCheckService(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.restrictionType).toEqual('stop')
      })
    })

    describe('and "stopOrReduce" is "reduce"', () => {
      describe('and "reduceAtThreshold" is "no"', () => {
        beforeEach(() => {
          sessionData = { ...sessionData, stopOrReduce: 'reduce', reduceAtThreshold: 'no' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('sets "restrictionType" as "reduce"', async () => {
          await SubmitCheckService(session.id, userId, yarStub)

          const result = await LicenceMonitoringStationModel.query()
            .where('monitoringStationId', sessionData.monitoringStationId)
            .first()

          expect(result.restrictionType).toEqual('reduce')
        })
      })

      describe('and "reduceAtThreshold" is "yes"', () => {
        beforeEach(() => {
          sessionData = { ...sessionData, stopOrReduce: 'reduce', reduceAtThreshold: 'yes' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('sets "restrictionType" as "stop_or_reduce"', async () => {
          await SubmitCheckService(session.id, userId, yarStub)

          const result = await LicenceMonitoringStationModel.query()
            .where('monitoringStationId', sessionData.monitoringStationId)
            .first()

          expect(result.restrictionType).toEqual('stop_or_reduce')
        })
      })
    })

    describe('and "conditionId" is a condition UUID', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, conditionId: generateUUID() }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('persists the licence version purpose condition id', async () => {
        await SubmitCheckService(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.licenceVersionPurposeConditionId).toEqual(sessionData.conditionId)
      })
    })

    describe('and "conditionId" is "no_condition"', () => {
      it('sets the licence version purpose condition id to NULL', async () => {
        await SubmitCheckService(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.licenceVersionPurposeConditionId).toBeNull()
      })
    })
  })
})
