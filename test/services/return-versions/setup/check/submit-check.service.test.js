'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const { generateUUID, generateRandomInteger } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Things we need to stub
const GenerateReturnVersionService = require('../../../../../app/services/return-versions/setup/check/generate-return-version.service.js')
const PersistReturnVersionService = require('../../../../../app/services/return-versions/setup/check/persist-return-version.service.js')
const ProcessLicenceReturnLogsService = require('../../../../../app/services/return-logs/process-licence-return-logs.service.js')
const VoidNoReturnRequiredLicenceReturnLogsService = require('../../../../../app/services/return-logs/void-return-logs.service.js')

// Thing under test
const SubmitCheckService = require('../../../../../app/services/return-versions/setup/check/submit-check.service.js')

describe('Return Versions Setup - Submit Check service', () => {
  let generateReturnVersionStub
  let licenceData
  let licenceVersionData
  let persistReturnVersionStub
  let processLicenceReturnLogsStub
  let returnVersionData
  let session
  let sessionData
  let userId
  let voidNoReturnRequiredLicenceReturnLogsStub

  beforeEach(() => {
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
    voidNoReturnRequiredLicenceReturnLogsStub = Sinon.stub(
      VoidNoReturnRequiredLicenceReturnLogsService,
      'go'
    ).resolves()
  })

  afterEach(() => {
    Sinon.restore()
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
      beforeEach(async () => {
        sessionData.reason = 'minor-change'
        session = await SessionHelper.add({ data: sessionData })

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
      beforeEach(async () => {
        sessionData.reason = 'succession-or-transfer-of-licence'
        session = await SessionHelper.add({ data: sessionData })

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
    beforeEach(async () => {
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

      session = await SessionHelper.add({ data: sessionData })

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
})
