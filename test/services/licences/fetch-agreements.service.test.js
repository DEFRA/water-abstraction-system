'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const FinancialAgreementHelper = require('../../support/helpers/financial-agreement.helper.js')
const LicenceAgreementHelper = require('../../support/helpers/licence-agreement.helper.js')

// Thing under test
const FetchAgreementsService =
  require('../../../app/services/licences/fetch-agreements.service.js')

describe('Fetch Agreements service', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has agreements data', () => {
    beforeEach(async () => {
      const financialAgreement = await FinancialAgreementHelper.add()

      testRecord = await LicenceAgreementHelper.add({
        financial_agreement_id: financialAgreement.id
      })
    })
    it('returns the matching agreements data', async () => {
      const result = await FetchAgreementsService.go(testRecord.licenceRef)

      expect(result).to.equal([
        {
          dateSigned: result[0].dateSigned,
          endDate: null,
          financialAgreements: [{ financialAgreementCode: 'S127' }],
          id: result[0].id,
          startDate: result[0].startDate
        }
      ])
    })
  })
})
