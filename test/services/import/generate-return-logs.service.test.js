'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const ProcessLicenceReturnLogsService = require('../../../app/services/return-logs/process-licence-return-logs.service.js')

// Thing under test
const GenerateReturnLogsService = require('../../../app/services/import/generate-return-logs.service.js')

describe('Generate Return Logs Service', () => {
  const changeDate = new Date('2024-05-26')
  const olderChangeDate = new Date('2024-05-20')
  const currentDate = new Date('2024-07-15')

  let clock
  let importedLicence
  let licence
  let notifierStub
  let processLicenceReturnLogsStub

  beforeEach(() => {
    // We control what the 'current' date is, so we can assert what the service does when not provided with `changeDate`
    clock = Sinon.useFakeTimers(currentDate)
    processLicenceReturnLogsStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when the imported licence has no end date and the existing licence has an expiredDate', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: changeDate, lapsedDate: null, revokedDate: null })
      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: null }
    })

    it('should call the GenerateReturnLogsService with the expiredDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(changeDate)
    })
  })

  describe('when the imported licence has no end date and the existing licence has a lapsedDate', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: null, lapsedDate: changeDate, revokedDate: null })
      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: null }
    })

    it('should call the GenerateReturnLogsService with the lapsedDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(changeDate)
    })
  })

  describe('when the imported licence has no end date and the existing licence has a revokedDate', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: null, lapsedDate: null, revokedDate: changeDate })
      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: null }
    })

    it('should call the GenerateReturnLogsService with the revokedDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(changeDate)
    })
  })

  describe('when the imported licence has an expiredDate and the existing licence has no end date', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: null, lapsedDate: null, revokedDate: null })
      importedLicence = { expiredDate: changeDate, lapsedDate: null, revokedDate: null }
    })

    it('should call the GenerateReturnLogsService with the expiredDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(changeDate)
    })
  })

  describe('when the imported licence has a lapsedDate and the existing licence has no end date', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: null, lapsedDate: null, revokedDate: null })
      importedLicence = { expiredDate: null, lapsedDate: changeDate, revokedDate: null }
    })

    it('should call the GenerateReturnLogsService with the lapsedDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(changeDate)
    })
  })

  describe('when the imported licence has a revokedDate and the existing licence has no end date', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: null, lapsedDate: null, revokedDate: null })
      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: changeDate }
    })

    it('should call the GenerateReturnLogsService with the revokedDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(changeDate)
    })
  })

  describe('when the imported licence has a revokedDate and the existing licence has an older revokedDate', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: null, lapsedDate: null, revokedDate: olderChangeDate })
      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: changeDate }
    })

    it('should call the GenerateReturnLogsService with the earlier revokedDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(olderChangeDate)
    })
  })

  describe('when the imported licence has an older revokedDate and the existing licence has a revokedDate', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: null, lapsedDate: null, revokedDate: changeDate })
      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: olderChangeDate }
    })

    it('should call the GenerateReturnLogsService with the earlier revokedDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(olderChangeDate)
    })
  })

  describe('when the imported licence has an older revokedDate and the existing licence has a revokedDate, expiredDate and lapsedDate', () => {
    before(async () => {
      licence = await LicenceHelper.add({ expiredDate: changeDate, lapsedDate: changeDate, revokedDate: changeDate })
      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: olderChangeDate }
    })

    it('should call the GenerateReturnLogsService with the earlier revokedDate', async () => {
      await GenerateReturnLogsService.go(licence.id, importedLicence)

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)

      const processReturnLogArgs = processLicenceReturnLogsStub.firstCall.args

      expect(processLicenceReturnLogsStub.callCount).to.equal(1)
      expect(processReturnLogArgs[1]).to.equal(olderChangeDate)
    })
  })
})
