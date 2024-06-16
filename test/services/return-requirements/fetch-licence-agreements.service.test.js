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
const FetchLicenceAgreementsService = require('../../../app/services/return-requirements/fetch-licence-agreements.service.js')

describe('Return Requirements - Fetch Licence Agreements service', () => {
  let licenceAgreement
  let financialAgreementId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const financialAgreement = await FinancialAgreementHelper.add({ code: 'S127' })
    financialAgreementId = financialAgreement.id
  })

  describe('when there are agreements for the licence', () => {
    describe('and the agreement has no end date', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({ financialAgreementId })
      })

      it('returns the financial agreement', async () => {
        const result = await FetchLicenceAgreementsService.go(licenceAgreement.licenceRef)

        expect(result).to.equal([{
          id: licenceAgreement.id,
          financialAgreementId,
          licenceRef: licenceAgreement.licenceRef,
          startDate: licenceAgreement.startDate,
          endDate: null,
          signedOn: licenceAgreement.signedOn,
          deletedAt: null,
          source: 'wrls',
          createdAt: licenceAgreement.createdAt,
          updatedAt: licenceAgreement.updatedAt,
          financialAgreement: { id: financialAgreementId }
        }])
      })
    })

    describe('and the agreement has an end date in the future', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({ financialAgreementId, endDate: new Date('2099-01-01') })
      })

      it('returns the financial agreement', async () => {
        const result = await FetchLicenceAgreementsService.go(licenceAgreement.licenceRef)

        expect(result).to.equal([{
          id: licenceAgreement.id,
          financialAgreementId,
          licenceRef: licenceAgreement.licenceRef,
          startDate: licenceAgreement.startDate,
          endDate: new Date('2099-01-01'),
          signedOn: licenceAgreement.signedOn,
          deletedAt: null,
          source: 'wrls',
          createdAt: licenceAgreement.createdAt,
          updatedAt: licenceAgreement.updatedAt,
          financialAgreement: { id: financialAgreementId }
        }])
      })
    })

    describe('but the agreement has an end date in the past', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({
          financialAgreementId,
          endDate: new Date('2023-12-31')
        })
      })

      it('returns no results', async () => {
        const result = await FetchLicenceAgreementsService.go(licenceAgreement.licenceRef)

        expect(result).to.be.empty()
      })
    })
  })

  describe('when there are no agreements for the licence', () => {
    it('returns no results', async () => {
      const result = await FetchLicenceAgreementsService.go('01/ABC')

      expect(result).to.be.empty()
    })
  })
})
