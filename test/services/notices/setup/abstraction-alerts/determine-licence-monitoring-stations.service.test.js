// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateUUID } from '../../../../../app/lib/general.lib.js'
import { licenceEnds } from '../../../../support/fixtures/licence.fixture.js'
import { yesterday } from '../../../../support/general.js'

// Things we need to stub
import * as FetchMonitoringStationDetailsDal from '../../../../../app/dal/monitoring-stations/fetch-monitoring-station-details.dal.js'

// Thing under test
import DetermineLicenceMonitoringStationsService from '../../../../../app/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js'

describe('Notices Setup - Abstraction Alerts - Determine Licence Monitoring Stations service', () => {
  let licenceMonitoringStations
  let monitoringStation
  let monitoringStationId
  beforeEach(() => {
    monitoringStationId = generateUUID()

    monitoringStation = {
      catchmentName: null,
      gridReference: 'TL2664640047',
      id: generateUUID(),
      label: 'BUSY POINT',
      riverName: null,
      stationReference: null,
      wiskiId: null
    }

    licenceMonitoringStations = [
      {
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 8,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        id: generateUUID(),
        measureType: 'flow',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licence: licenceEnds(),
        licenceVersionPurposeCondition: null
      },
      {
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        id: generateUUID(),
        measureType: 'level',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licence: licenceEnds(),
        licenceVersionPurposeCondition: {
          id: generateUUID(),
          notes: 'I have a bad feeling about this'
        }
      },
      {
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        id: generateUUID(),
        latestNotification: null,
        licence: licenceEnds(),
        licenceVersionPurposeCondition: {
          id: generateUUID(),
          notes: '"                   "             "                    "'
        },
        measureType: 'level',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100
      }
    ]

    vi.spyOn(FetchMonitoringStationDetailsDal, 'default').mockResolvedValue({
      licenceMonitoringStations,
      monitoringStation
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly returns the data', async () => {
    const result = await DetermineLicenceMonitoringStationsService(monitoringStationId)

    expect(result).toEqual({
      licenceMonitoringStations: [
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 8,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          id: licenceMonitoringStations[0].id,
          latestNotification: null,
          licence: {
            expiredDate: null,
            id: licenceMonitoringStations[0].licence.id,
            lapsedDate: null,
            licenceRef: licenceMonitoringStations[0].licence.licenceRef,
            revokedDate: null
          },
          measureType: 'flow',
          notes: null,
          restrictionType: 'reduce',
          thresholdGroup: 'flow-100-m3/s',
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        },
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          id: licenceMonitoringStations[1].id,
          latestNotification: null,
          licence: {
            expiredDate: null,
            id: licenceMonitoringStations[1].licence.id,
            lapsedDate: null,
            licenceRef: licenceMonitoringStations[1].licence.licenceRef,
            revokedDate: null
          },
          measureType: 'level',
          notes: 'I have a bad feeling about this',
          restrictionType: 'reduce',
          thresholdGroup: 'level-100-m3/s',
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        },
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          id: licenceMonitoringStations[2].id,
          latestNotification: null,
          licence: {
            expiredDate: null,
            id: licenceMonitoringStations[2].licence.id,
            lapsedDate: null,
            licenceRef: licenceMonitoringStations[2].licence.licenceRef,
            revokedDate: null
          },
          measureType: 'level',
          notes: '"                   "             "                    "',
          restrictionType: 'reduce',
          thresholdGroup: 'level-100-m3/s',
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        }
      ],
      monitoringStationId,
      monitoringStationName: 'BUSY POINT',
      monitoringStationRiverName: null
    })
  })

  describe('when a licence has ended', () => {
    beforeEach(() => {
      licenceMonitoringStations[1].licence.revokedDate = yesterday()
      licenceMonitoringStations[2].licence.expiredDate = yesterday()

      vi.spyOn(FetchMonitoringStationDetailsDal, 'default').mockResolvedValue({
        licenceMonitoringStations,
        monitoringStation
      })
    })

    it('does not return ended licences', async () => {
      const result = await DetermineLicenceMonitoringStationsService(monitoringStationId)

      expect(result).toEqual({
        licenceMonitoringStations: [
          {
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 8,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            id: licenceMonitoringStations[0].id,
            latestNotification: null,
            licence: {
              expiredDate: null,
              id: licenceMonitoringStations[0].licence.id,
              lapsedDate: null,
              licenceRef: licenceMonitoringStations[0].licence.licenceRef,
              revokedDate: null
            },
            measureType: 'flow',
            notes: null,
            restrictionType: 'reduce',
            thresholdGroup: 'flow-100-m3/s',
            thresholdUnit: 'm3/s',
            thresholdValue: 100
          }
        ],
        monitoringStationId,
        monitoringStationName: 'BUSY POINT',
        monitoringStationRiverName: null
      })
    })
  })

  describe('the "licenceMonitoringStations" property', () => {
    describe('the "notes" property', () => {
      describe('when there are "notes"', () => {
        it('returns the "notes"', async () => {
          const result = await DetermineLicenceMonitoringStationsService(monitoringStationId)

          expect(result.licenceMonitoringStations[1].notes).toEqual('I have a bad feeling about this')
        })
      })

      describe('when "notes" is null', () => {
        it('returns null', async () => {
          const result = await DetermineLicenceMonitoringStationsService(monitoringStationId)

          expect(result.licenceMonitoringStations[0].notes).toEqual(null)
        })
      })

      describe('when the "notes" is weird! `"                   "             "                    "`', () => {
        it('returns the weird notes', async () => {
          const result = await DetermineLicenceMonitoringStationsService(monitoringStationId)

          expect(result.licenceMonitoringStations[2].notes).toEqual(
            '"                   "             "                    "'
          )
        })
      })
    })

    describe('the "thresholdGroup" property', () => {
      it('generates a "thresholdGroup" for each licence monitoring station', async () => {
        const result = await DetermineLicenceMonitoringStationsService(monitoringStationId)

        expect(result.licenceMonitoringStations[0].thresholdGroup).toEqual('flow-100-m3/s')
      })
    })
  })
})
