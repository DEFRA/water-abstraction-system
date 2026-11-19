// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import LicenceMonitoringStationHelper from 'water-abstraction-engine/test/helpers/licence-monitoring-station.helper.js'
import LicenceMonitoringStationModel from 'water-abstraction-engine/models/licence-monitoring-station.model.js'
import { yesterday } from 'water-abstraction-engine/test/general.js'

// Thing under test
import RecordAlertSentDal from '../../../src/dal/licence-monitoring-station/record-alert-sent.dal.js'

describe('Licence Monitoring Station - Record Alert Sent DAL', () => {
  let licenceMonitoringStation
  let status
  let statusUpdatedAt
  let trx

  beforeEach(async () => {
    licenceMonitoringStation = await LicenceMonitoringStationHelper.add()
    statusUpdatedAt = yesterday()
    status = 'warning'
  })

  afterEach(async () => {
    await licenceMonitoringStation.$query().delete()
  })

  describe('when called', () => {
    describe('without a transaction', () => {
      it('updates the status of the licence monitoring station (tag)', async () => {
        await RecordAlertSentDal(licenceMonitoringStation.id, status, statusUpdatedAt, trx)

        const updatedLicenceMonitoringStation = await licenceMonitoringStation
          .$query()
          .findById(licenceMonitoringStation.id)

        expect(updatedLicenceMonitoringStation.status).toEqual(status)
        expect(updatedLicenceMonitoringStation.statusUpdatedAt).toEqual(statusUpdatedAt)
      })
    })

    describe('with a transaction', () => {
      beforeEach(async () => {
        trx = await LicenceMonitoringStationModel.startTransaction()
      })

      afterEach(async () => {
        if (trx && !trx.isCompleted()) {
          await trx.rollback()
        }
      })

      it('updates the status of the licence monitoring station (tag)', async () => {
        await RecordAlertSentDal(licenceMonitoringStation.id, status, statusUpdatedAt, trx)
        await trx.commit()

        const updatedLicenceMonitoringStation = await licenceMonitoringStation
          .$query()
          .findById(licenceMonitoringStation.id)

        expect(updatedLicenceMonitoringStation.status).toEqual(status)
        expect(updatedLicenceMonitoringStation.statusUpdatedAt).toEqual(statusUpdatedAt)
      })
    })
  })
})
