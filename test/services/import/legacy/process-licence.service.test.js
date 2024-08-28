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
const PersistLicenceService = require('../../../../app/services/import/persist-licence.service.js')
const TransformLicenceService = require('../../../../app/services/import/legacy/transform-licence.service.js')
const TransformLicenceVersionsService = require('../../../../app/services/import/legacy/transform-licence-versions.service.js')
const TransformLicenceVersionPurposesService = require('../../../../app/services/import/legacy/transform-licence-version-purposes.service.js')

// Thing under test
const ProcessLicenceService = require('../../../../app/services/import/legacy/process-licence.service.js')

describe('Import Legacy Process Licence service', () => {
  const naldLicenceId = '2113'
  const regionCode = '6'

  let licenceId
  let licenceRef
  let notifierStub
  let persistLicenceServiceStub
  let transformedLicence

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    transformedLicence = _transformedLicence(licenceRef)

    Sinon.stub(TransformLicenceService, 'go').resolves({ naldLicenceId, regionCode, transformedLicence })
    Sinon.stub(TransformLicenceVersionsService, 'go').resolves()
    Sinon.stub(TransformLicenceVersionPurposesService, 'go').resolves(transformedLicence)

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

  describe('when there is a valid NALD licence to import', () => {
    beforeEach(() => {
      persistLicenceServiceStub = Sinon.stub(PersistLicenceService, 'go').resolves(licenceId)
    })

    it('saves the imported licence', async () => {
      await ProcessLicenceService.go(licenceRef)

      expect(persistLicenceServiceStub.calledWith(transformedLicence)).to.be.true()
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
          externalId: '6:10000004'
        },
        {
          externalId: '6:10000005'
        }
      ]
    }]
  }
}