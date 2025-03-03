'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const LicenceSupplementaryYearModel = require('../../../app/models/licence-supplementary-year.model.js')

// Thing under test
const UnassignBillRunToLicencesService = require('../../../app/services/bill-runs/unassign-bill-run-to-licences.service.js')

describe('Bill Runs - Unassign Bill Run To Licence service', () => {
  const billRunId = '091c3d3f-0328-4b10-b1a1-3eccf55416a0'

  let licenceSupplementaryYearPatch
  let licenceSupplementaryYearWhere

  beforeEach(() => {
    licenceSupplementaryYearPatch = Sinon.stub().returnsThis()
    licenceSupplementaryYearWhere = Sinon.stub()

    Sinon.stub(LicenceSupplementaryYearModel, 'query').returns({
      patch: licenceSupplementaryYearPatch,
      where: licenceSupplementaryYearWhere
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('updates the matching "LicenceSupplementaryYear" records with a null bill run ID', async () => {
      await UnassignBillRunToLicencesService.go(billRunId)

      const patchArgs = licenceSupplementaryYearPatch.args[0][0]

      expect(patchArgs.billRunId).to.be.null()

      const whereArgs = licenceSupplementaryYearWhere.args[0]

      expect(whereArgs).to.equal(['billRunId', '091c3d3f-0328-4b10-b1a1-3eccf55416a0'])
    })
  })
})
