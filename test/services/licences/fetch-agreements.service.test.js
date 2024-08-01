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
const FetchAgreementsService = require('../../../app/services/licences/fetch-agreements.service.js')

describe('Fetch Agreements service', () => {
  const licenceRef = '01/12/34/1000'
  let licenceAgreementData

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has agreements data', () => {
    beforeEach(async () => {
      const financialAgreement = await FinancialAgreementHelper.add({
        id: '970168ce-06c3-4823-b84d-9da30b742bb8',
        code: 'S127'
      })

      licenceAgreementData = {
        endDate: new Date('2040-05-01'),
        financialAgreementId: financialAgreement.id,
        licenceRef,
        startDate: new Date('2022-04-01'),
        signedOn: new Date('2022-04-01')
      }
    })

    describe('and the agreement has not been deleted', () => {
      beforeEach(async () => {
        await LicenceAgreementHelper.add(licenceAgreementData)
      })

      it('returns the matching agreements data', async () => {
        const results = await FetchAgreementsService.go(licenceRef)

        expect(results[0]).to.equal({
          startDate: new Date('2022-04-01'),
          signedOn: new Date('2022-04-01'),
          endDate: new Date('2040-05-01'),
          financialAgreement: { id: '970168ce-06c3-4823-b84d-9da30b742bb8', code: 'S127' }
        }, { skip: ['id'] })
      })
    })

    describe('and the agreement has been deleted', () => {
      beforeEach(async () => {
        await LicenceAgreementHelper.add(licenceAgreementData.deletedAt = new Date())
      })

      it('does not return the agreements data', async () => {
        const results = await FetchAgreementsService.go(licenceRef)

        expect(results).to.be.empty()
      })
    })
  })
})
