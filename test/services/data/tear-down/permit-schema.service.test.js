'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const PermitLicenceHelper = require('../../../support/helpers/permit-licence.helper.js')

// Models
const PermitLicenceModel = require('../../../../app/models/permit-licence.model.js')

// Thing under test
const PermitSchemaService = require('../../../../app/services/data/tear-down/permit-schema.service.js')

describe.only('Permit schema service', () => {
  describe('go', () => {
    let permitLicence

    beforeEach(async () => {
      permitLicence = await PermitLicenceHelper.add({ metadata: { source: 'acceptance-test-setup' } })
    })

    it('removes all loaded permit schema test data', async () => {
      await PermitSchemaService.go()

      expect(await PermitLicenceModel.query().findById(permitLicence.id)).to.be.undefined()
    })
  })
})
