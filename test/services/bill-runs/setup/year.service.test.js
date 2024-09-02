'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchLicenceSupplementaryYearsService = require('../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js')

// Thing under test
const YearService = require('../../../../app/services/bill-runs/setup/year.service.js')

describe('Bill Runs Setup Year service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { type: 'two_part_supplementary', year: 2024 } })

    Sinon.stub(FetchLicenceSupplementaryYearsService, 'go').resolves([{ financialYearEnd: 2024 }])
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await YearService.go(session.id)

      expect(result).to.equal({
        financialYearsData: [{ text: '2023 to 2024', value: 2024, checked: true }],
        sessionId: session.id,
        selectedYear: 2024
      })
    })
  })
})
