'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const CreateReturnVersionService = require('../../../../../app/services/return-versions/setup/check/create-return-version.service.js')
const DeleteSessionDal = require('../../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')
const GenerateReturnVersionService = require('../../../../../app/services/return-versions/setup/check/generate-return-version.service.js')
const ProcessExistingReturnVersionsService = require('../../../../../app/services/return-versions/setup/check/process-existing-return-versions.service.js')
const ProcessLicenceReturnLogsService = require('../../../../../app/services/return-logs/process-licence-return-logs.service.js')
const UpdateSucceededReturnLogsDal = require('../../../../../app/dal/return-versions/update-succeeded-return-logs.dal.js')
const VoidReturnLogsService = require('../../../../../app/services/return-logs/void-return-logs.service.js')

// Thing under test
const SubmitCheckService = require('../../../../../app/services/return-versions/setup/check/submit-check.service.js')

describe('Return Versions - Setup - Submit Check service', () => {
  let createReturnVersionStub
  let fetchSessionStub
  let generatedReturnVersionData
  let generateReturnVersionStub
  let notifierStub
  let processExistingReturnVersionsStub
  let processLicenceReturnLogsStub
  let session
  let sessionData
  let updateSucceededReturnLogsStub
  let userId
  let voidReturnLogsStub

  beforeEach(() => {
    userId = 12345

    sessionData = {
      checkPageVisited: true,
      journey: 'returns-required',
      licence: {
        id: '7cf4a46b-1375-42c8-bfe7-24c1bfff765c',
        endDate: null,
        startDate: '1967-12-08T00:00:00.000Z',
        licenceRef: '99/99/9999',
        licenceHolder: 'A licence holder',
        returnVersions: [
          {
            id: '1b67ad84-1511-4944-834d-00814899564f',
            reason: null,
            startDate: '2023-02-13T00:00:00.000Z'
          },
          {
            id: '745886bd-b73a-41e8-819c-dfd89d44ca91',
            reason: null,
            startDate: '2008-04-01T00:00:00.000Z'
          }
        ],
        currentVersionStartDate: '2023-02-13T00:00:00.000Z'
      },
      method: 'use-existing-requirements',
      multipleUpload: false,
      quarterlyReturns: false,
      reason: 'minor-change',
      requirements: [
        {
          points: ['796f83bb-d50d-446f-bc47-28daff6bcb78'],
          purposes: [
            {
              id: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
              alias: ''
            }
          ],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Site Number One',
          abstractionPeriod: {
            abstractionPeriodEndDay: '31',
            abstractionPeriodEndMonth: '3',
            abstractionPeriodStartDay: '1',
            abstractionPeriodStartMonth: '4'
          },
          frequencyReported: 'month',
          frequencyCollected: 'week',
          agreementsExceptions: ['none']
        }
      ],
      returnVersionStartDate: '2023-02-13',
      startDateOptions: 'licenceStartDate'
    }

    generatedReturnVersionData = {
      returnRequirements: [
        {
          abstractionPeriodStartDay: '1',
          abstractionPeriodStartMonth: '4',
          abstractionPeriodEndDay: '31',
          abstractionPeriodEndMonth: '3',
          collectionFrequency: 'week',
          fiftySixException: false,
          gravityFill: false,
          points: ['796f83bb-d50d-446f-bc47-28daff6bcb78'],
          reabstraction: false,
          reportingFrequency: 'month',
          returnsFrequency: 'year',
          returnRequirementPurposes: [
            {
              alias: null,
              primaryPurposeId: 'c6fd4b2a-82b5-42b0-a98a-087ba52f9a4f',
              purposeId: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
              secondaryPurposeId: '0a80d135-9bd4-40ec-90ff-f4a365ccac3f'
            }
          ],
          siteDescription: 'Site Number One',
          summer: false,
          twoPartTariff: false
        }
      ],
      returnVersion: {
        createdBy: userId,
        endDate: null,
        licenceId: sessionData.licence.id,
        multipleUpload: sessionData.multipleUpload,
        notes: undefined,
        quarterlyReturns: sessionData.quarterlyReturns,
        reason: sessionData.reason,
        startDate: new Date(sessionData.returnVersionStartDate),
        status: 'current',
        version: 1
      }
    }

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go')
    generateReturnVersionStub = Sinon.stub(GenerateReturnVersionService, 'go')
    processExistingReturnVersionsStub = Sinon.stub(ProcessExistingReturnVersionsService, 'go').resolves()
    createReturnVersionStub = Sinon.stub(CreateReturnVersionService, 'go')
    processLicenceReturnLogsStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go')
    voidReturnLogsStub = Sinon.stub(VoidReturnLogsService, 'go').resolves()
    updateSucceededReturnLogsStub = Sinon.stub(UpdateSucceededReturnLogsDal, 'go').resolves()

    Sinon.stub(DeleteSessionDal, 'go').resolves()

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when called to create a new return version', () => {
    beforeEach(() => {
      session = SessionModelStub.build(Sinon, sessionData)
      fetchSessionStub.resolves(session)

      generateReturnVersionStub.resolves(generatedReturnVersionData)

      createReturnVersionStub.resolves({
        ...generatedReturnVersionData.returnVersion,
        id: '3c87ff18-5930-480d-9a64-07a7c7b1fcae'
      })

      processLicenceReturnLogsStub.resolves()
    })

    it('creates the new return version and associated data', async () => {
      await SubmitCheckService.go(session.id, userId)

      expect(createReturnVersionStub.called).to.be.true()
      expect(createReturnVersionStub.firstCall.args[0]).to.equal(generatedReturnVersionData)
    })

    it('processes existing return logs for the licence', async () => {
      await SubmitCheckService.go(session.id, userId)

      expect(processLicenceReturnLogsStub.called).to.be.true()
      expect(processLicenceReturnLogsStub.firstCall.args[0]).to.equal(
        generatedReturnVersionData.returnVersion.licenceId
      )

      // The change date is the new return version start date minus one day
      const expectedChangeDate = new Date(generatedReturnVersionData.returnVersion.startDate)

      expectedChangeDate.setDate(expectedChangeDate.getDate() - 1)

      expect(processLicenceReturnLogsStub.firstCall.args[1]).to.equal(expectedChangeDate)
    })

    describe('and the setup journey', () => {
      describe('was "standard"', () => {
        it('does NOT attempt to void all return logs in the period it covers', async () => {
          await SubmitCheckService.go(session.id, userId)

          expect(voidReturnLogsStub.called).to.be.false()
        })
      })

      describe('was "no-returns-required"', () => {
        beforeEach(() => {
          sessionData.journey = 'no-returns-required'
          sessionData.reason = 'returns-exception'
          sessionData.requirements = []
          session = SessionModelStub.build(Sinon, sessionData)
          fetchSessionStub.resolves(session)
        })

        it('does attempt to void all return logs in the period it covers', async () => {
          await SubmitCheckService.go(session.id, userId)

          expect(voidReturnLogsStub.called).to.be.true()
          expect(voidReturnLogsStub.firstCall.args[0]).to.equal(sessionData.licence.licenceRef)
          expect(voidReturnLogsStub.firstCall.args[1]).to.equal(generatedReturnVersionData.returnVersion.startDate)
          expect(voidReturnLogsStub.firstCall.args[2]).to.equal(generatedReturnVersionData.returnVersion.endDate)
        })
      })
    })

    describe('and it is the first return version for the licence', () => {
      it('skips processing existing return versions', async () => {
        await SubmitCheckService.go(session.id, userId)

        expect(processExistingReturnVersionsStub.called).to.be.false()
      })
    })

    describe('and it is NOT the first return version for the licence', () => {
      beforeEach(() => {
        generatedReturnVersionData.returnVersion.version = 2
        generateReturnVersionStub.resolves(generatedReturnVersionData)

        createReturnVersionStub.resolves({
          ...generatedReturnVersionData.returnVersion,
          id: '3c87ff18-5930-480d-9a64-07a7c7b1fcae'
        })
      })

      it('processes existing return versions impacted by the new return version', async () => {
        await SubmitCheckService.go(session.id, userId)

        expect(processExistingReturnVersionsStub.called).to.be.true()
        expect(processExistingReturnVersionsStub.firstCall.args[0]).to.equal(
          generatedReturnVersionData.returnVersion.licenceId
        )
        expect(processExistingReturnVersionsStub.firstCall.args[1]).to.equal(
          generatedReturnVersionData.returnVersion.startDate
        )
      })
    })

    describe("and the new return version's reason", () => {
      describe('is NOT "succession-or-transfer-of-licence"', () => {
        it('does NOT update the existing return logs as succeeded', async () => {
          await SubmitCheckService.go(session.id, userId)

          expect(updateSucceededReturnLogsStub.called).to.be.false()
        })
      })

      describe('is "succession-or-transfer-of-licence"', () => {
        beforeEach(() => {
          sessionData.reason = 'succession-or-transfer-of-licence'
          session = SessionModelStub.build(Sinon, sessionData)
          fetchSessionStub.resolves(session)

          generatedReturnVersionData.returnVersion.reason = 'succession-or-transfer-of-licence'
          generateReturnVersionStub.resolves(generatedReturnVersionData)

          createReturnVersionStub.resolves({
            ...generatedReturnVersionData.returnVersion,
            id: '3c87ff18-5930-480d-9a64-07a7c7b1fcae'
          })
        })

        it('updates the existing return logs as succeeded', async () => {
          await SubmitCheckService.go(session.id, userId)

          expect(updateSucceededReturnLogsStub.called).to.be.true()
          expect(updateSucceededReturnLogsStub.firstCall.args[0]).to.equal(sessionData.licence.licenceRef)
        })
      })
    })

    describe('but the service errors', () => {
      beforeEach(() => {
        processLicenceReturnLogsStub.rejects()
      })

      it('logs the error and rethrows it', async () => {
        await expect(SubmitCheckService.go(session.id, userId)).to.reject()

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Failed to create return version')
        expect(args[1]).to.equal(session)
        expect(args[2]).to.be.an.error()
      })
    })
  })
})
