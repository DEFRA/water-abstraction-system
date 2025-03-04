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
const UnassignLicencesToBillRunService = require('../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js')

describe('Bill Runs - Unassign Licences To Bill Run service', () => {
  const billRunId = '091c3d3f-0328-4b10-b1a1-3eccf55416a0'
  const licenceIds = ['098e0fff-1c3e-4be3-83b9-8f483ae5b41e', '406b8ba4-63b6-442a-86f3-a144f1f63ca9']

  let licenceSupplementaryYearPatch
  let licenceSupplementaryYearWhereIn
  let licenceSupplementaryYearWhere

  beforeEach(() => {
    licenceSupplementaryYearPatch = Sinon.stub().returnsThis()
    licenceSupplementaryYearWhereIn = Sinon.stub().returnsThis()
    licenceSupplementaryYearWhere = Sinon.stub()

    Sinon.stub(LicenceSupplementaryYearModel, 'query').returns({
      patch: licenceSupplementaryYearPatch,
      whereIn: licenceSupplementaryYearWhereIn,
      where: licenceSupplementaryYearWhere
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('updates the matching "LicenceSupplementaryYear" records with a null bill run ID', async () => {
      await UnassignLicencesToBillRunService.go(licenceIds, billRunId)

      const patchArgs = licenceSupplementaryYearPatch.args[0][0]

      expect(patchArgs.billRunId).to.be.null()

      const whereInArgs = licenceSupplementaryYearWhereIn.args[0]

      expect(whereInArgs).to.equal(['licenceId', licenceIds])

      const whereArgs = licenceSupplementaryYearWhere.args[0]

      expect(whereArgs).to.equal(['billRunId', '091c3d3f-0328-4b10-b1a1-3eccf55416a0'])
    })
  })
})
