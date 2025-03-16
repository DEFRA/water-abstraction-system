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
const AssignBillRunToLicencesService = require('../../../app/services/bill-runs/assign-bill-run-to-licences.service.js')

describe('Bill Runs - Assign Bill Run To Licences service', () => {
  const billingPeriod = { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  const billRunId = '091c3d3f-0328-4b10-b1a1-3eccf55416a0'
  const twoPartTariff = true

  let licenceSupplementaryYearPatch
  let licenceSupplementaryYearWhere

  beforeEach(() => {
    licenceSupplementaryYearPatch = Sinon.stub().returnsThis()
    licenceSupplementaryYearWhere = Sinon.stub().returnsThis()

    Sinon.stub(LicenceSupplementaryYearModel, 'query').returns({
      patch: licenceSupplementaryYearPatch,
      where: licenceSupplementaryYearWhere
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('assigns the bill run ID to the matching "LicenceSupplementaryYear" records', async () => {
      await AssignBillRunToLicencesService.go(billRunId, billingPeriod, twoPartTariff)

      const patchArgs = licenceSupplementaryYearPatch.args[0][0]

      expect(patchArgs.billRunId).to.equal(billRunId)

      const financialYearWhereArgs = licenceSupplementaryYearWhere.firstCall.args

      expect(financialYearWhereArgs).to.equal(['financialYearEnd', 2023])

      const twoPartTariffWhereArgs = licenceSupplementaryYearWhere.secondCall.args

      expect(twoPartTariffWhereArgs).to.equal(['twoPartTariff', true])
    })
  })
})
