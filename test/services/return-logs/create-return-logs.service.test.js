'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

// Thing under test
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')

describe('Return Logs - Create Return Logs service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let clock
  let insertStub
  let notifierStub
  let returnCycle
  let returnRequirement

  beforeEach(() => {
    insertStub = Sinon.stub().returnsThis()
    Sinon.stub(ReturnLogModel, 'query').returns({
      insert: insertStub,
      onConflict: Sinon.stub().returnsThis(),
      ignore: Sinon.stub().resolves()
    })

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
    delete global.GlobalNotifier
  })

  describe('when called', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      returnCycle = _returnCycle()
      returnRequirement = _returnRequirement()
    })

    it('will persist the return logs generated from the return requirement and cycle passed in', async () => {
      await CreateReturnLogsService.go(returnRequirement, returnCycle)

      expect(insertStub.callCount).to.equal(1)

      // Check we create the return log as expected
      const [insertObject] = insertStub.args[0]

      // NOTE: We don't assert every property of the object passed in because we know it is coming from
      // GenerateReturnLogService and that has its own suite of tests. We do however confirm that the createdAt and
      // UpdatedAt properties are set because those only get set in the service
      expect(insertObject.id).to.equal('v1:4:01/25/90/3242:16999651:2024-04-01:2025-03-31')
      expect(insertObject.createdAt).to.exist()
      expect(insertObject.updatedAt).to.exist()
    })

    it('returns the return log IDs it generated', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

      expect(results).to.equal(['v1:4:01/25/90/3242:16999651:2024-04-01:2025-03-31'])
    })

    describe('and an error occurs when creating the return logs', () => {
      beforeEach(() => {
        // NOTE: We stub the generate service to throw purely because it is easier to structure our tests on that basis.
        // But if the actual insert were to throw the expected behaviour would be the same.
        Sinon.stub(GenerateReturnLogService, 'go').throws()
      })

      it('handles the error', async () => {
        await CreateReturnLogsService.go(returnRequirement, returnCycle)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Return logs creation errored')
        expect(args[1].returnRequirement.id).to.equal('4bc1efa7-10af-4958-864e-32acae5c6fa4')
        expect(args[1].returnCycle.id).to.equal('6889b98d-964f-4966-b6d6-bf511d6526a1')
        expect(args[2]).to.be.an.error()
      })
    })
  })
})

function _returnCycle() {
  return {
    id: '6889b98d-964f-4966-b6d6-bf511d6526a1',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    dueDate: new Date('2025-04-28'),
    summer: false,
    submittedInWrls: true
  }
}

function _returnRequirement() {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    externalId: '4:16999651',
    id: '4bc1efa7-10af-4958-864e-32acae5c6fa4',
    legacyId: 16999651,
    reportingFrequency: 'day',
    returnVersionId: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
    siteDescription: 'BOREHOLE AT AVALON',
    summer: false,
    twoPartTariff: false,
    upload: false,
    returnVersion: {
      endDate: null,
      id: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
      reason: 'new-licence',
      startDate: new Date('2022-04-01'),
      licence: {
        expiredDate: null,
        id: '3acf7d80-cf74-4e86-8128-13ef687ea091',
        lapsedDate: null,
        licenceRef: '01/25/90/3242',
        revokedDate: null,
        areacode: 'SAAR',
        region: {
          id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
          naldRegionId: 4
        }
      }
    },
    points: [
      {
        description: 'Winter cycle - live licence - live return version - winter return requirement',
        ngr1: 'TG 713 291',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }
    ],
    returnRequirementPurposes: [
      {
        alias: 'Purpose alias for testing',
        id: '06c4c2f2-3dff-4053-bbc8-e6f64cd39623',
        primaryPurpose: {
          description: 'Agriculture',
          id: 'b6bb3b77-cfe8-4f22-8dc9-e92713ca3156',
          legacyId: 'A'
        },
        purpose: {
          description: 'General Farming & Domestic',
          id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
          legacyId: '140'
        },
        secondaryPurpose: {
          description: 'General Agriculture',
          id: '2457bfeb-a120-4b57-802a-46494bd22f82',
          legacyId: 'AGR'
        }
      }
    ]
  }
}
