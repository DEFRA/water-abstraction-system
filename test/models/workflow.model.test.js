// Test helpers
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import WorkflowHelper from '../support/helpers/workflow.helper.js'

// Thing under test
import WorkflowModel from '../../app/models/workflow.model.js'

describe('Workflow model', () => {
  let testLicence
  let testRecord

  beforeAll(async () => {
    testLicence = await LicenceHelper.add()

    testRecord = await WorkflowHelper.add({ licenceId: testLicence.id })
  })

  afterAll(async () => {
    await testLicence.$query().delete()
    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await WorkflowModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(WorkflowModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await WorkflowModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await WorkflowModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(WorkflowModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })
  })
})
