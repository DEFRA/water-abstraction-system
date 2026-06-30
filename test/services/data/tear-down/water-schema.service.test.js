'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Models
const ChargeElementModel = require('../../../../app/models/charge-element.model.js')
const ChargeReferenceModel = require('../../../../app/models/charge-reference.model.js')
const ChargeVersionModel = require('../../../../app/models/charge-version.model.js')
const LicenceAgreementModel = require('../../../../app/models/licence-agreement.model.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const LicenceMonitoringStationModel = require('../../../../app/models/licence-monitoring-station.model.js')
const LicenceVersionModel = require('../../../../app/models/licence-version.model.js')
const LicenceVersionPurposeModel = require('../../../../app/models/licence-version-purpose.model.js')
const MonitoringStationModel = require('../../../../app/models/monitoring-station.model.js')

// Services
const LoadService = require('../../../../app/services/data/load/load.service.js')

// Thing under test
const WaterSchemaService = require('../../../../app/services/data/tear-down/water-schema.service.js')

describe.only('Water schema service', () => {
  describe('go', () => {
    let loadResult

    beforeEach(async () => {
      const testRegion = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)
      const chargeCategory = ChargeCategoryHelper.select()
      const licenceRef = LicenceHelper.generateLicenceRef()
      const licenceId = generateUUID()
      const licenceVersionId = generateUUID()
      const chargeVersionId = generateUUID()
      const chargeReferenceId = generateUUID()
      const monitoringStationId = generateUUID()

      loadResult = await LoadService.go({
        licences: [
          {
            id: licenceId,
            licenceRef,
            regionId: testRegion.id,
            regions: { historicalAreaCode: 'SAAR', regionalChargeArea: testRegion.displayName },
            startDate: '2022-01-01'
          }
        ],
        licenceVersions: [{ id: licenceVersionId, licenceId }],
        licenceVersionPurposes: [{ licenceVersionId }],
        chargeVersions: [{ id: chargeVersionId, licenceId, licenceRef }],
        chargeReferences: [{ id: chargeReferenceId, chargeVersionId, chargeCategoryId: chargeCategory.id }],
        chargeElements: [{ chargeReferenceId }],
        licenceAgreements: [{ licenceRef }],
        monitoringStations: [{ id: monitoringStationId }],
        licenceMonitoringStations: [{ licenceId, monitoringStationId }]
      })
    })

    it('removes all loaded water schema test data', async () => {
      await WaterSchemaService.go()

      expect(await LicenceModel.query().findById(loadResult.licences[0])).to.be.undefined()
      expect(await LicenceVersionModel.query().findById(loadResult.licenceVersions[0])).to.be.undefined()
      expect(await LicenceVersionPurposeModel.query().findById(loadResult.licenceVersionPurposes[0])).to.be.undefined()
      expect(await ChargeVersionModel.query().findById(loadResult.chargeVersions[0])).to.be.undefined()
      expect(await ChargeReferenceModel.query().findById(loadResult.chargeReferences[0])).to.be.undefined()
      expect(await ChargeElementModel.query().findById(loadResult.chargeElements[0])).to.be.undefined()
      expect(await LicenceAgreementModel.query().findById(loadResult.licenceAgreements[0])).to.be.undefined()
      expect(await MonitoringStationModel.query().findById(loadResult.monitoringStations[0])).to.be.undefined()
      expect(
        await LicenceMonitoringStationModel.query().findById(loadResult.licenceMonitoringStations[0])
      ).to.be.undefined()
    })
  })
})
