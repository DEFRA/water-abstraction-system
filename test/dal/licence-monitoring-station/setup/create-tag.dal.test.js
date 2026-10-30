// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceMonitoringStationModel from 'water-abstraction-engine/models/licence-monitoring-station.model.js'
import { generateUserId, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import CreateTagDal from '../../../../src/dal/licence-monitoring-station/setup/create-tag.dal.js'

describe('Licence Monitoring Station - Setup - Create Tag dal', () => {
  let session
  let today
  let userId

  beforeEach(() => {
    session = {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 10,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      conditionId: 'no_condition',
      licenceId: generateUUID(),
      monitoringStationId: generateUUID(),
      reduceAtThreshold: null,
      stopOrReduce: 'stop',
      threshold: 100,
      unit: 'Ml/d'
    }

    today = new Date('2026-10-30')
    userId = generateUserId()

    vi.useFakeTimers({ now: today, toFake: ['Date'] })
  })

  afterEach(async () => {
    vi.useRealTimers()

    await LicenceMonitoringStationModel.query().delete().where('monitoringStationId', session.monitoringStationId)
  })

  describe('when called', () => {
    it('creates the licence monitoring station record', async () => {
      await CreateTagDal(session, userId)

      const result = await _fetchTag(session.monitoringStationId)

      expect(result).toEqual({
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 10,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        createdAt: today,
        createdBy: userId,
        deletedAt: null,
        id: expect.any(String),
        licenceId: session.licenceId,
        licenceVersionPurposeConditionId: null,
        measureType: 'flow',
        monitoringStationId: session.monitoringStationId,
        restrictionType: 'stop',
        source: 'wrls',
        status: 'resume',
        statusUpdatedAt: null,
        thresholdUnit: 'Ml/d',
        thresholdValue: 100,
        updatedAt: today
      })
    })
  })

  describe('when the unit is a flow unit', () => {
    beforeEach(() => {
      session.unit = 'm3/s'
    })

    it('sets the "measureType" to "flow"', async () => {
      await CreateTagDal(session, userId)

      const result = await _fetchTag(session.monitoringStationId)

      expect(result.measureType).toEqual('flow')
    })
  })

  describe('when the unit is a level unit', () => {
    beforeEach(() => {
      session.unit = 'mAOD'
    })

    it('sets the "measureType" to "level"', async () => {
      await CreateTagDal(session, userId)

      const result = await _fetchTag(session.monitoringStationId)

      expect(result.measureType).toEqual('level')
    })
  })

  describe('when "stopOrReduce" is "stop"', () => {
    it('sets the "restrictionType" to "stop"', async () => {
      await CreateTagDal(session, userId)

      const result = await _fetchTag(session.monitoringStationId)

      expect(result.restrictionType).toEqual('stop')
    })
  })

  describe('when "stopOrReduce" is "reduce"', () => {
    beforeEach(() => {
      session.stopOrReduce = 'reduce'
    })

    describe('and "reduceAtThreshold" is "no"', () => {
      beforeEach(() => {
        session.reduceAtThreshold = 'no'
      })

      it('sets the "restrictionType" to "reduce"', async () => {
        await CreateTagDal(session, userId)

        const result = await _fetchTag(session.monitoringStationId)

        expect(result.restrictionType).toEqual('reduce')
      })
    })

    describe('and "reduceAtThreshold" is "yes"', () => {
      beforeEach(() => {
        session.reduceAtThreshold = 'yes'
      })

      it('sets the "restrictionType" to "stop_or_reduce"', async () => {
        await CreateTagDal(session, userId)

        const result = await _fetchTag(session.monitoringStationId)

        expect(result.restrictionType).toEqual('stop_or_reduce')
      })
    })
  })

  describe('when "conditionId" is a condition UUID', () => {
    beforeEach(() => {
      session.conditionId = generateUUID()
    })

    it('sets the "licenceVersionPurposeConditionId" to the condition UUID', async () => {
      await CreateTagDal(session, userId)

      const result = await _fetchTag(session.monitoringStationId)

      expect(result.licenceVersionPurposeConditionId).toEqual(session.conditionId)
    })
  })

  describe('when "conditionId" is "no_condition"', () => {
    it('sets the "licenceVersionPurposeConditionId" to null', async () => {
      await CreateTagDal(session, userId)

      const result = await _fetchTag(session.monitoringStationId)

      expect(result.licenceVersionPurposeConditionId).toBeNull()
    })
  })
})

async function _fetchTag(monitoringStationId) {
  return LicenceMonitoringStationModel.query().where('monitoringStationId', monitoringStationId).first()
}
