'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things to stub
const PersistLicenceService = require('../../../../app/services/import/persist-import.service.js')
const ProcessLicenceReturnLogsService = require('../../../../app/services/jobs/return-logs/process-licence-return-logs.service.js')
const TransformAddressesService = require('../../../../app/services/import/legacy/transform-addresses.service.js')
const TransformCompaniesService = require('../../../../app/services/import/legacy/transform-companies.service.js')
const TransformContactsService = require('../../../../app/services/import/legacy/transform-contacts.service.js')
const TransformLicenceService = require('../../../../app/services/import/legacy/transform-licence.service.js')
const TransformLicenceVersionPurposeConditionsService = require('../../../../app/services/import/legacy/transform-licence-version-purpose-conditions.service.js')
const TransformLicenceVersionPurposesService = require('../../../../app/services/import/legacy/transform-licence-version-purposes.service.js')
const TransformLicenceVersionsService = require('../../../../app/services/import/legacy/transform-licence-versions.service.js')

// Thing under test
const ProcessLicenceService = require('../../../../app/services/import/legacy/process-licence.service.js')

describe('Import Legacy Process Licence service', () => {
  const naldLicenceId = '2113'
  const regionCode = '6'

  let licenceId
  let licenceRef
  let notifierStub
  let persistLicenceServiceStub
  let processLicenceReturnLogsServiceStub
  let transformedLicence
  let wrlsLicenceId

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()
    wrlsLicenceId = licenceId

    transformedLicence = _transformedLicence(licenceRef)

    Sinon.stub(TransformLicenceVersionsService, 'go').resolves()
    Sinon.stub(TransformLicenceVersionPurposesService, 'go').resolves(transformedLicence)
    Sinon.stub(TransformLicenceVersionPurposeConditionsService, 'go').resolves(transformedLicence)
    Sinon.stub(TransformCompaniesService, 'go').resolves({ company: [], transformedCompany: [] })
    Sinon.stub(TransformContactsService, 'go').resolves()
    Sinon.stub(TransformAddressesService, 'go').resolves()

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when there is a valid NALD licence to import with an existing licence', () => {
    beforeEach(() => {
      Sinon.stub(TransformLicenceService, 'go').resolves({ naldLicenceId, regionCode, transformedLicence, wrlsLicenceId })
      persistLicenceServiceStub = Sinon.stub(PersistLicenceService, 'go').resolves(licenceId)
      processLicenceReturnLogsServiceStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    })

    it('saves the imported licence and creates the return logs', async () => {
      await ProcessLicenceService.go(licenceRef)

      expect(persistLicenceServiceStub.calledWith(transformedLicence)).to.be.true()
      expect(processLicenceReturnLogsServiceStub.calledWith(wrlsLicenceId)).to.be.true()
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessLicenceService.go(licenceRef)

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(
        notifierStub.omg.calledWith('Legacy licence import complete')
      ).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.licenceId).to.equal(licenceId)
      expect(logDataArg.licenceRef).to.equal(licenceRef)
    })
  })

  describe('when there is a valid NALD licence to import without an existing licence', () => {
    beforeEach(() => {
      Sinon.stub(TransformLicenceService, 'go').resolves({ naldLicenceId, regionCode, transformedLicence })
      persistLicenceServiceStub = Sinon.stub(PersistLicenceService, 'go').resolves(licenceId)
      processLicenceReturnLogsServiceStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    })

    it('saves the imported licence but does not process the return logs', async () => {
      await ProcessLicenceService.go(licenceRef)

      expect(persistLicenceServiceStub.calledWith(transformedLicence)).to.be.true()
      expect(processLicenceReturnLogsServiceStub.calledWith(wrlsLicenceId)).to.be.false()
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      persistLicenceServiceStub = Sinon.stub(PersistLicenceService, 'go').rejects()
    })

    it('handles the error', async () => {
      await ProcessLicenceService.go(licenceRef)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Legacy licence import errored')
      expect(args[1]).to.equal({ licenceRef })
      expect(args[2]).to.be.an.error()
    })
  })
})

// NOTE: This is an incomplete transformed licence. But this minimum valid structure saves us having to also stub
// the LicenceStructureValidator
function _transformedLicence (licenceRef) {
  return {
    licenceRef,
    licenceVersions: [{
      externalId: '6:2113:100:0',
      licenceVersionPurposes: [
        {
          externalId: '6:10000004',
          licenceVersionPurposeConditions: []
        },
        {
          externalId: '6:10000005',
          licenceVersionPurposeConditions: []
        }
      ]
    }]
  }
}
