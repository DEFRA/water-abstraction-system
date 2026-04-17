'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')
const { generateUUID, generateRandomInteger } = require('../../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')
const GenerateReturnVersionService = require('../../../../../app/services/return-versions/setup/check/generate-return-version.service.js')
const PersistReturnVersionService = require('../../../../../app/services/return-versions/setup/check/create-return-version.service.js')
const ProcessLicenceReturnLogsService = require('../../../../../app/services/return-logs/process-licence-return-logs.service.js')
const VoidReturnLogsService = require('../../../../../app/services/return-logs/void-return-logs.service.js')

// Thing under test
const SubmitCheckService = require('../../../../../app/services/return-versions/setup/check/submit-check.service.js')

describe('Return Versions Setup - Submit Check service', () => {
  let generateReturnVersionStub
  let licenceData
  let licenceVersionData
  let notifierStub
  let persistReturnVersionStub
  let processLicenceReturnLogsStub
  let returnVersionData
  let session
  let sessionData
  let userId
  let voidNoReturnRequiredLicenceReturnLogsStub

  beforeEach(() => {
    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    userId = generateRandomInteger(5000, 9999)

    returnVersionData = {
      id: generateUUID(),
      reason: null,
      modLogs: [],
      startDate: '2022-04-01T00:00:00.000Z'
    }

    licenceData = {
      id: generateUUID(),
      currentVersionStartDate: '2023-01-01T00:00:00.000Z',
      endDate: null,
      licenceRef: generateLicenceRef(),
      licenceHolder: 'Turbo Kid',
      returnVersions: [{ ...returnVersionData }],
      startDate: '1994-04-01T00:00:00.000Z',
      waterUndertaker: false
    }

    licenceVersionData = {
      id: generateUUID(),
      copyableReturnVersions: [{ ...returnVersionData }],
      endDate: null,
      startDate: returnVersionData.startDate
    }

    processLicenceReturnLogsStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    voidNoReturnRequiredLicenceReturnLogsStub = Sinon.stub(VoidReturnLogsService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the "return-required" journey is used', () => {
    beforeEach(() => {
      sessionData = {
        checkPageVisited: false,
        licence: { ...licenceData },
        licenceVersion: { ...licenceVersionData },
        journey: 'returns-required',
        method: 'useExistingRequirements',
        multipleUpload: true,
        quarterlyReturns: false,
        requirements: [{}],
        returnVersionStartDate: licenceData.startDate,
        startDateOptions: 'licenceStartDate'
      }
    })

    describe('and the reason is NOT "succession-or-transfer-of-licence"', () => {
      beforeEach(() => {
        sessionData.reason = 'minor-change'

        session = SessionModelStub.build(Sinon, sessionData)

        Sinon.stub(FetchSessionDal, 'go').resolves(session)

        generateReturnVersionStub = Sinon.stub(GenerateReturnVersionService, 'go').resolves({
          returnVersion: {
            createdBy: userId,
            endDate: null,
            licenceId: licenceData.id,
            multipleUpload: sessionData.multipleUpload,
            notes: undefined,
            quarterlyReturns: sessionData.quarterlyReturns,
            reason: sessionData.reason,
            startDate: licenceData.startDate,
            status: 'current',
            version: 2
          }
        })

        persistReturnVersionStub = Sinon.stub(PersistReturnVersionService, 'go').resolves({
          createdBy: userId,
          endDate: null,
          licenceId: licenceData.id,
          multipleUpload: sessionData.multipleUpload,
          notes: undefined,
          quarterlyReturns: sessionData.quarterlyReturns,
          reason: sessionData.reason,
          startDate: licenceData.startDate,
          status: 'current',
          version: 2,
          id: generateUUID()
        })
      })

      it('creates the new return version including requirements, deals with existing ones, processes the return logs and returns the licence ID', async () => {
        const result = await SubmitCheckService.go(session.id, userId)

        expect(generateReturnVersionStub.called).to.be.true()
        expect(persistReturnVersionStub.called).to.be.true()
        expect(processLicenceReturnLogsStub.called).to.be.true()
        expect(voidNoReturnRequiredLicenceReturnLogsStub.called).to.be.false()

        expect(result).to.equal(session.licence.id)
      })
    })

    describe('and the reason is "succession-or-transfer-of-licence"', () => {
      beforeEach(() => {
        sessionData.reason = 'succession-or-transfer-of-licence'

        session = SessionModelStub.build(Sinon, sessionData)

        Sinon.stub(FetchSessionDal, 'go').resolves(session)

        generateReturnVersionStub = Sinon.stub(GenerateReturnVersionService, 'go').resolves({
          returnVersion: {
            createdBy: userId,
            endDate: null,
            licenceId: licenceData.id,
            multipleUpload: sessionData.multipleUpload,
            notes: undefined,
            quarterlyReturns: sessionData.quarterlyReturns,
            reason: sessionData.reason,
            startDate: licenceData.startDate,
            status: 'current',
            version: 2
          }
        })

        persistReturnVersionStub = Sinon.stub(PersistReturnVersionService, 'go').resolves({
          createdBy: userId,
          endDate: null,
          licenceId: licenceData.id,
          multipleUpload: sessionData.multipleUpload,
          notes: undefined,
          quarterlyReturns: sessionData.quarterlyReturns,
          reason: sessionData.reason,
          startDate: licenceData.startDate,
          status: 'current',
          version: 2,
          id: generateUUID()
        })
      })

      it('creates the new return version including requirements, deals with existing ones, processes the return logs and returns the licence ID', async () => {
        const result = await SubmitCheckService.go(session.id, userId)

        expect(generateReturnVersionStub.called).to.be.true()
        expect(persistReturnVersionStub.called).to.be.true()
        expect(processLicenceReturnLogsStub.called).to.be.true()
        expect(voidNoReturnRequiredLicenceReturnLogsStub.called).to.be.false()

        expect(result).to.equal(session.licence.id)
      })
    })
  })

  describe('when the "no-returns-required" journey is used', () => {
    beforeEach(() => {
      sessionData = {
        checkPageVisited: false,
        licence: { ...licenceData },
        licenceVersion: { ...licenceVersionData },
        journey: 'no-returns-required',
        multipleUpload: true,
        reason: 'succession-or-transfer-of-licence',
        requirements: [{}],
        returnVersionStartDate: licenceData.startDate,
        startDateOptions: 'licenceStartDate'
      }

      session = SessionModelStub.build(Sinon, sessionData)

      Sinon.stub(FetchSessionDal, 'go').resolves(session)

      generateReturnVersionStub = Sinon.stub(GenerateReturnVersionService, 'go').resolves({
        returnVersion: {
          createdBy: userId,
          endDate: null,
          licenceId: licenceData.id,
          multipleUpload: sessionData.multipleUpload,
          notes: undefined,
          quarterlyReturns: sessionData.quarterlyReturns,
          reason: sessionData.reason,
          startDate: licenceData.startDate,
          status: 'current',
          version: 2
        }
      })

      persistReturnVersionStub = Sinon.stub(PersistReturnVersionService, 'go').resolves({
        createdBy: userId,
        endDate: null,
        licenceId: licenceData.id,
        multipleUpload: sessionData.multipleUpload,
        notes: undefined,
        quarterlyReturns: sessionData.quarterlyReturns,
        reason: sessionData.reason,
        startDate: licenceData.startDate,
        status: 'current',
        version: 2,
        id: generateUUID()
      })
    })

    it('creates the new return version including requirements, deals with existing ones, processes the return logs and returns the licence ID', async () => {
      const result = await SubmitCheckService.go(session.id, userId)

      expect(generateReturnVersionStub.called).to.be.true()
      expect(persistReturnVersionStub.called).to.be.true()
      expect(processLicenceReturnLogsStub.called).to.be.true()
      expect(voidNoReturnRequiredLicenceReturnLogsStub.called).to.be.true()

      expect(result).to.equal(session.licence.id)
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      sessionData = {}
      session = SessionModelStub.build(Sinon, sessionData)
      Sinon.stub(FetchSessionDal, 'go').resolves(session)

      Sinon.stub(GenerateReturnVersionService, 'go').rejects()
    })

    it('logs the error and rethrows it', async () => {
      await expect(SubmitCheckService.go(session.id, userId)).to.reject()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Failed to set up new requirements')
      expect(args[1]).to.equal(session)
      expect(args[2]).to.be.an.error()
    })
  })
})
