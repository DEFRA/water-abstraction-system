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

describe('Return requirements Fetch Licence Agreements service', () => {
  describe('when a licence agreement has a start date but no end date', () => {
    let licenceAgreement
    let testFinancialAgreements

    beforeEach(async () => {
      await DatabaseSupport.clean()

      testFinancialAgreements = await FinancialAgreementHelper.add()

      const { id: financialAgreementId } = testFinancialAgreements

      licenceAgreement = await LicenceAgreementHelper.add({ financialAgreementId })
    })

    it('should return a result with one financial agreement', async () => {
      const result = await FetchLicenceAgreementsService.go(licenceAgreement.licenceRef)

      expect(result).to.equal([{
        id: licenceAgreement.id,
        financialAgreementId: licenceAgreement.financialAgreementId,
        licenceRef: licenceAgreement.licenceRef,
        startDate: licenceAgreement.startDate,
        endDate: null,
        dateSigned: licenceAgreement.dateSigned,
        deletedAt: null,
        source: 'nald',
        createdAt: licenceAgreement.createdAt,
        updatedAt: licenceAgreement.updatedAt,
        financialAgreements: [{
          id: testFinancialAgreements.id
        }]
      }])
    })
  })

  describe('when a licence agreement has a start date and an end date in the future', () => {
    let licenceAgreement
    let testFinancialAgreements
    const today = new Date()
    const tomorrowWithTime = new Date(today.getTime() + 86400000)
    const tomorrow = new Date(tomorrowWithTime.getFullYear(), tomorrowWithTime.getMonth(), tomorrowWithTime.getDate() + 1)

    beforeEach(async () => {
      await DatabaseSupport.clean()

      testFinancialAgreements = await FinancialAgreementHelper.add()

      const { id: financialAgreementId } = testFinancialAgreements

      licenceAgreement = await LicenceAgreementHelper.add({
        financialAgreementId,
        endDate: tomorrow
      })
    })

    it('should return a result with one financial agreement', async () => {
      const result = await FetchLicenceAgreementsService.go(licenceAgreement.licenceRef)

      expect(result).to.equal([{
        id: licenceAgreement.id,
        financialAgreementId: licenceAgreement.financialAgreementId,
        licenceRef: licenceAgreement.licenceRef,
        startDate: licenceAgreement.startDate,
        endDate: tomorrow,
        dateSigned: licenceAgreement.dateSigned,
        deletedAt: null,
        source: 'nald',
        createdAt: licenceAgreement.createdAt,
        updatedAt: licenceAgreement.updatedAt,
        financialAgreements: [{
          id: testFinancialAgreements.id
        }]
      }])
    })
  })

  describe('when a licence agreement has a start date and an end date is in the past', () => {
    let licenceAgreement
    let testFinancialAgreements

    beforeEach(async () => {
      await DatabaseSupport.clean()

      testFinancialAgreements = await FinancialAgreementHelper.add()

      const { id: financialAgreementId } = testFinancialAgreements

      licenceAgreement = await LicenceAgreementHelper.add({
        financialAgreementId,
        endDate: new Date('2023-12-31')
      })
    })

    it('should return an empty array', async () => {
      const result = await FetchLicenceAgreementsService.go(licenceAgreement.licenceRef)

      expect(result).to.equal([])
    })
  })
})
