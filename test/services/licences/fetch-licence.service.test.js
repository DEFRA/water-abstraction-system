'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const licenceSupplementaryYearHelper = require('../../support/helpers/licence-supplementary-year.helper.js')
const WorkflowHelper = require('../../support/helpers/workflow.helper.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

describe('Fetch Licence service', () => {
  let licence
  let licenceSupplementaryYearId
  let workflow

  describe('when there is a matching licence', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()

      const licenceSupplementaryYear = await licenceSupplementaryYearHelper.add({
        licenceId: licence.id,
        twoPartTariff: true
      })

      licenceSupplementaryYearId = licenceSupplementaryYear.id

      // We add two workflow records: one reflects that the licence is in workflow, so of that it previously was but
      // has been dealt with. We want to ensure these soft-deleted records are ignored so licences are not flagged
      // as changed incorrectly
      workflow = await WorkflowHelper.add({ licenceId: licence.id })
      await WorkflowHelper.add({ deletedAt: new Date('2023-06-01'), licenceId: licence.id })
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
        licenceSupplementaryYears: [{
          id: licenceSupplementaryYearId
        }],
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
