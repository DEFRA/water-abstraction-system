'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../../../app/models/return-version.model.js')

// Thing under test
const CreateNewReturnVersionService = require('../../../../app/services/return-logs/setup/create-new-return-version.service.js')

describe('Return Logs Setup - Create New Return Version service', () => {
  let licence

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    await ReturnVersionHelper.add({
      licenceId: licence.id,
      status: 'current',
      version: 1
    })
  })

  describe('when called with valid data', () => {
    it('creates a new return version', async () => {
      const result = await CreateNewReturnVersionService.go(licence.id)

      const newReturnVersion = await ReturnVersionModel.query().findById(result.newReturnVersionId)

      expect(newReturnVersion.version).to.equal(2)
      expect(newReturnVersion.status).to.equal('current')
    })

    it('marks previous versions as superseded', async () => {
      await CreateNewReturnVersionService.go(licence.id)

      const previousVersion = await ReturnVersionModel.query()
        .where('licenceId', licence.id)
        .where('version', 1)
        .first()

      expect(previousVersion.status).to.equal('superseded')
    })
  })
})
