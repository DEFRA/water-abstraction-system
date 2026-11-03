// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import MonitoringStationHelper from 'water-abstraction-engine/test/helpers/monitoring-station.helper.js'

// Thing under test
import FetchMonitoringStationDal from '../../../../src/dal/licence-monitoring-station/setup/fetch-monitoring-station.dal.js'

describe('Licence Monitoring Station - Setup - Fetch Monitoring Station dal', () => {
  let monitoringStation

  beforeAll(async () => {
    monitoringStation = await MonitoringStationHelper.add()
  })

  afterAll(async () => {
    await monitoringStation.$query().delete()
  })

  it('returns the monitoring station with the data needed to set up a licence monitoring station', async () => {
    const result = await FetchMonitoringStationDal(monitoringStation.id)

    expect(result).toEqual({ label: monitoringStation.label })
  })
})
