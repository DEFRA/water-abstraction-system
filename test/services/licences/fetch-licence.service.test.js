'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const WorkflowHelper = require('../../support/helpers/workflow.helper.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

describe('Fetch Licence service', () => {
  let licence
  let workflow

  describe('when there is a matching licence', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
      workflow = await WorkflowHelper.add({ licenceId: licence.id })
    })

    it('returns the matching licence', async () => {
      const result = await FetchLicenceService.go(licence.id)

      expect(result).to.be.an.instanceOf(LicenceModel)
      expect(result).to.equal({
        id: licence.id,
        includeInPresrocBilling: 'no',
        includeInSrocBilling: false,
        licenceRef: licence.licenceRef,
        expiredDate: null,
        revokedDate: null,
        lapsedDate: null,
        licenceDocumentHeader: null,
        workflows: [{
          id: workflow.id,
          status: workflow.status
        }]
      })
    })
  })

  describe('when there is not a matching licence', () => {
    it('returns undefined', async () => {
      const result = await FetchLicenceService.go('4ba2066b-4623-4102-801a-c771e39af2f3')

      expect(result).to.be.undefined()
    })
  })
})
