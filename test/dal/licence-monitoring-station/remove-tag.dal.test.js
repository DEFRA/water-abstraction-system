// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceMonitoringStationHelper from 'water-abstraction-engine/test/helpers/licence-monitoring-station.helper.js'
import LicenceMonitoringStationModel from 'water-abstraction-engine/models/licence-monitoring-station.model.js'

// Thing under test
import RemoveTagDal from '../../../src/dal/licence-monitoring-station/remove-tag.dal.js'

describe('Licence Monitoring Station - Remove Tag dal', () => {
  let licenceMonitoringStation
  let today

  beforeEach(async () => {
    licenceMonitoringStation = await LicenceMonitoringStationHelper.add()

    today = new Date('2026-10-29')

    vi.useFakeTimers({ now: today, toFake: ['Date'] })
  })

  afterEach(async () => {
    vi.useRealTimers()

    await licenceMonitoringStation.$query().delete()
  })

  it('soft deletes the licence monitoring station', async () => {
    await RemoveTagDal(licenceMonitoringStation.id)

    const result = await LicenceMonitoringStationModel.query().findById(licenceMonitoringStation.id)

    expect(result).toEqual({
      ...licenceMonitoringStation,
      deletedAt: today,
      updatedAt: today
    })
  })
})
