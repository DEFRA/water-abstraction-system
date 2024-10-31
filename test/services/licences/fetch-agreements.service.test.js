'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const FinancialAgreementHelper = require('../../support/helpers/financial-agreement.helper.js')
const LicenceAgreementHelper = require('../../support/helpers/licence-agreement.helper.js')

// Thing under test
const FetchAgreementsService = require('../../../app/services/licences/fetch-agreements.service.js')

const FINANCIAL_AGREEMENT_S130U_INDEX = 5

describe('Fetch Agreements service', () => {
  const endDate = new Date('2040-05-01')
  const signedOn = new Date('2022-04-01')
  const startDate = new Date('2022-04-01')

  let licenceAgreement
  let financialAgreement

  describe('when the licence has agreements data', () => {
    before(async () => {
      financialAgreement = FinancialAgreementHelper.select(FINANCIAL_AGREEMENT_S130U_INDEX)
    })

    describe('and the agreement has not been deleted', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({
          endDate,
          financialAgreementId: financialAgreement.id,
          startDate,
          signedOn
        })
      })

      it('returns the matching agreements data', async () => {
        const results = await FetchAgreementsService.go(licenceAgreement.licenceRef)

        expect(results[0]).to.equal({
          endDate,
          financialAgreement: {
            id: financialAgreement.id,
            code: financialAgreement.code
          },
          startDate,
          signedOn
        }, { skip: ['id'] })
      })
    })

    describe('and the agreement has been deleted', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({
          endDate,
          financialAgreementId: financialAgreement.id,
          startDate,
          signedOn,
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
