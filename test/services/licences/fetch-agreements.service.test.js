'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FinancialAgreementHelper = require('../../support/helpers/financial-agreement.helper.js')
const LicenceAgreementHelper = require('../../support/helpers/licence-agreement.helper.js')

// Thing under test
const FetchAgreementsService = require('../../../app/services/licences/fetch-agreements.service.js')

describe('Fetch Agreements service', () => {
  let licenceAgreement
  let financialAgreement

  describe('when the licence has agreements data', () => {
    beforeEach(async () => {
      financialAgreement = await FinancialAgreementHelper.add()
    })

    describe('and the agreement has not been deleted', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({
          endDate: new Date('2040-05-01'),
          financialAgreementId: financialAgreement.id,
          startDate: new Date('2022-04-01'),
          signedOn: new Date('2022-04-01')
        })
      })

      it('returns the matching agreements data', async () => {
        const results = await FetchAgreementsService.go(licenceAgreement.licenceRef)

        expect(results[0]).to.equal({
          startDate: new Date('2022-04-01'),
          signedOn: new Date('2022-04-01'),
          endDate: new Date('2040-05-01'),
          financialAgreement: {
            id: financialAgreement.id,
            code: financialAgreement.code
          }
        }, { skip: ['id'] })
      })
    })

    describe('and the agreement has been deleted', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({
          endDate: new Date('2040-05-01'),
          financialAgreementId: financialAgreement.id,
          startDate: new Date('2022-04-01'),
          signedOn: new Date('2022-04-01'),
          deletedAt: new Date()
        })
      })

      it('does not return the agreements data', async () => {
        const results = await FetchAgreementsService.go(licenceAgreement.licenceRef)

        expect(results).to.be.empty()
      })
    })
  })
})
