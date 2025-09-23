'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceMonitoringStationHelper = require('../support/helpers/licence-monitoring-station.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')
const MonitoringStationHelper = require('../support/helpers/monitoring-station.helper.js')
const MonitoringStationModel = require('../../app/models/monitoring-station.model.js')
const NotificationHelper = require('../support/helpers/notification.helper.js')
const NotificationModel = require('../../app/models/notification.model.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')

// Thing under test
const LicenceMonitoringStationModel = require('../../app/models/licence-monitoring-station.model.js')

describe('Licence Monitoring Station model', () => {
  let testLicence
  let testLicenceVersionPurposeCondition
  let testMonitoringStation
  let testNotifications
  let testRecord
  let testUser

  before(async () => {
    testLicence = await LicenceHelper.add()
    testLicenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add()
    testMonitoringStation = await MonitoringStationHelper.add()
    testUser = await UserHelper.add()

    testRecord = await LicenceMonitoringStationHelper.add({
      createdBy: testUser.id,
      licenceId: testLicence.id,
      licenceVersionPurposeConditionId: testLicenceVersionPurposeCondition.id,
      monitoringStationId: testMonitoringStation.id
    })

    testNotifications = []
    for (let i = 0; i < 2; i++) {
      const billLicence = await NotificationHelper.add({
        licenceMonitoringStationId: testRecord.id
      })

      testNotifications.push(billLicence)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceMonitoringStationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceMonitoringStationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceMonitoringStationModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceMonitoringStationModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceMonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to licence version purpose condition', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceMonitoringStationModel.query().innerJoinRelated('licenceVersionPurposeCondition')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose condition', async () => {
        const result = await LicenceMonitoringStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeCondition')

        expect(result).to.be.instanceOf(LicenceMonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposeCondition).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.licenceVersionPurposeCondition).to.equal(testLicenceVersionPurposeCondition)
      })
    })

    describe('when linking to monitoring station', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceMonitoringStationModel.query().innerJoinRelated('monitoringStation')

        expect(query).to.exist()
      })

      it('can eager load the monitoring station', async () => {
        const result = await LicenceMonitoringStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('monitoringStation')

        expect(result).to.be.instanceOf(LicenceMonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.monitoringStation).to.be.an.instanceOf(MonitoringStationModel)
        expect(result.monitoringStation).to.equal(testMonitoringStation)
      })
    })

    describe('when linking to notifications', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceMonitoringStationModel.query().innerJoinRelated('monitoringStation')

        expect(query).to.exist()
      })

      it('can eager load the notifications', async () => {
        const result = await LicenceMonitoringStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('notifications')

        expect(result).to.be.instanceOf(LicenceMonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.notifications).to.be.an.array()
        expect(result.notifications[0]).to.be.an.instanceOf(NotificationModel)
        expect(result.notifications).to.include(testNotifications[0])
        expect(result.notifications).to.include(testNotifications[1])
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceMonitoringStationModel.query().innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await LicenceMonitoringStationModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).to.be.instanceOf(LicenceMonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser)
      })
    })
  })
})
