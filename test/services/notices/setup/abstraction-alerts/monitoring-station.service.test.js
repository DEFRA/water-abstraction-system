'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../../support/helpers/licence.helper.js')
const LicenceMonitoringStationModel = require('../../../../support/helpers/licence-monitoring-station.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposesHelper = require('../../../../support/helpers/licence-version-purpose.helper.js')
const MonitoringStationHelper = require('../../../../support/helpers/monitoring-station.helper.js')

// Thing under test
const MonitoringStationService = require('../../../../../app/services/notices/setup/abstraction-alerts/monitoring-station.service.js')

describe('Notices Setup - Abstraction alerts - Monitoring station service', () => {
  let monitoringStation
  let licence
  let licenceWithVersionPurpose
  let licenceVersionPurposeCondition

  beforeEach(async () => {
    monitoringStation = await MonitoringStationHelper.add()

    // A licence with the abstraction data from the Licence monitoring station
    licence = await LicenceHelper.add()

    await LicenceMonitoringStationModel.add({
      licenceId: licence.id,
      monitoringStationId: monitoringStation.id,
      abstraction_period_end_day: '01',
      abstraction_period_end_month: '01',
      abstraction_period_start_day: '01',
      abstraction_period_start_month: '02'
    })

    // A licence with the abstraction data from the licence version purpose
    licenceWithVersionPurpose = await LicenceHelper.add()

    const licenceVersionPurposes = await LicenceVersionPurposesHelper.add()

    licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurposes.id
    })

    await LicenceMonitoringStationModel.add({
      licenceId: licenceWithVersionPurpose.id,
      licenceVersionPurposeConditionId: licenceVersionPurposeCondition.id,
      monitoringStationId: monitoringStation.id,
      abstraction_period_end_day: '01',
      abstraction_period_end_month: '01',
      abstraction_period_start_day: '01',
      abstraction_period_start_month: '02'
    })
  })

  it('correctly returns the data', async () => {
    const result = await MonitoringStationService.go(monitoringStation.id)

    expect(result).to.equal([
      {
        abstraction_period_end_day: 1,
        abstraction_period_end_month: 1,
        abstraction_period_start_day: 1,
        abstraction_period_start_month: 2,
        label: 'MONITOR PLACE',
        licence_id: licence.id,
        licence_ref: licence.licenceRef,
        licence_version_purpose_condition_id: null,
        restriction_type: 'reduce',
        start_date: new Date('2022-01-01'),
        status: 'resume',
        status_updated_at: null,
        threshold_unit: 'm3/s',
        threshold_value: 100
      },
      {
        abstraction_period_end_day: 31,
        abstraction_period_end_month: 3,
        abstraction_period_start_day: 1,
        abstraction_period_start_month: 1,
        label: 'MONITOR PLACE',
        licence_id: licenceWithVersionPurpose.id,
        licence_ref: licenceWithVersionPurpose.licenceRef,
        licence_version_purpose_condition_id: licenceVersionPurposeCondition.id,
        restriction_type: 'reduce',
        start_date: new Date('2022-01-01'),
        status: 'resume',
        status_updated_at: null,
        threshold_unit: 'm3/s',
        threshold_value: 100
      }
    ])
  })

  describe('when the licence has a licence version purpose', () => {
    it('correctly returns the data', async () => {
      const result = await MonitoringStationService.go(monitoringStation.id)

      expect(result[1]).to.equal({
        abstraction_period_end_day: 31,
        abstraction_period_end_month: 3,
        abstraction_period_start_day: 1,
        abstraction_period_start_month: 1,
        label: 'MONITOR PLACE',
        licence_id: licenceWithVersionPurpose.id,
        licence_ref: licenceWithVersionPurpose.licenceRef,
        licence_version_purpose_condition_id: licenceVersionPurposeCondition.id,
        restriction_type: 'reduce',
        start_date: new Date('2022-01-01'),
        status: 'resume',
        status_updated_at: null,
        threshold_unit: 'm3/s',
        threshold_value: 100
      })
    })
  })

  describe('when the licence does not have a licence version purpose', () => {
    it('correctly returns the data', async () => {
      const result = await MonitoringStationService.go(monitoringStation.id)

      expect(result[0]).to.equal({
        abstraction_period_end_day: 1,
        abstraction_period_end_month: 1,
        abstraction_period_start_day: 1,
        abstraction_period_start_month: 2,
        label: 'MONITOR PLACE',
        licence_id: licence.id,
        licence_ref: licence.licenceRef,
        licence_version_purpose_condition_id: null,
        restriction_type: 'reduce',
        start_date: new Date('2022-01-01'),
        status: 'resume',
        status_updated_at: null,
        threshold_unit: 'm3/s',
        threshold_value: 100
      })
    })
  })
})
