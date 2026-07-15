// Test helpers
import * as LicenceMonitoringStationHelper from '../support/helpers/licence-monitoring-station.helper.js'
import * as LicenceVersionPurposeConditionHelper from '../support/helpers/licence-version-purpose-condition.helper.js'
import * as LicenceVersionPurposeConditionTypeHelper from '../support/helpers/licence-version-purpose-condition-type.helper.js'
import * as LicenceVersionPurposeHelper from '../support/helpers/licence-version-purpose.helper.js'
import LicenceMonitoringStationModel from '../../app/models/licence-monitoring-station.model.js'
import LicenceVersionPurposeConditionTypeModel from '../../app/models/licence-version-purpose-condition-type.model.js'
import LicenceVersionPurposeModel from '../../app/models/licence-version-purpose.model.js'

// Thing under test
import LicenceVersionPurposeConditionModel from '../../app/models/licence-version-purpose-condition.model.js'

describe('Licence Version Purpose Condition model', () => {
  let testLicenceMonitoringStations
  let testLicenceVersionPurposeConditionType
  let testLicenceVersionPurpose
  let testRecord

  beforeAll(async () => {
    testLicenceVersionPurposeConditionType = LicenceVersionPurposeConditionTypeHelper.select()
    testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()

    testRecord = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionType.id,
      licenceVersionPurposeId: testLicenceVersionPurpose.id
    })

    testLicenceMonitoringStations = []
    for (let i = 0; i < 2; i++) {
      const licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
        licenceVersionPurposeConditionId: testRecord.id
      })

      testLicenceMonitoringStations.push(licenceMonitoringStation)
    }
  })

  afterAll(async () => {
    await testLicenceVersionPurpose.$query().delete()

    for (const licenceMonitoringStation of testLicenceMonitoringStations) {
      await licenceMonitoringStation.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceVersionPurposeConditionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence monitoring stations', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query().innerJoinRelated('licenceMonitoringStations')

        expect(query).toBeDefined()
      })

      it('can eager load the licence monitoring stations', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceMonitoringStations')

        expect(result).toBeInstanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceMonitoringStations).toBeInstanceOf(Array)
        expect(result.licenceMonitoringStations[0]).toBeInstanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStations).toContainEqual(testLicenceMonitoringStations[0])
        expect(result.licenceMonitoringStations).toContainEqual(testLicenceMonitoringStations[1])
      })
    })

    describe('when linking to licence version purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query().innerJoinRelated('licenceVersionPurpose')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purpose', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurpose')

        expect(result).toBeInstanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersionPurpose).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurpose).toEqual(testLicenceVersionPurpose)
      })
    })

    describe('when linking to licence version purpose condition type', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query().innerJoinRelated(
          'licenceVersionPurposeConditionType'
        )

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purpose condition type', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditionType')

        expect(result).toBeInstanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.licenceVersionPurposeConditionType).toBeInstanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.licenceVersionPurposeConditionType).toMatchObject(testLicenceVersionPurposeConditionType)
      })
    })
  })
})
