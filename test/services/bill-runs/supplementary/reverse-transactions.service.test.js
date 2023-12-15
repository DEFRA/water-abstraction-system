'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReverseTransactionsService = require('../../../../app/services/bill-runs/supplementary/reverse-transactions.service.js')

describe('Reverse Transactions service', () => {
  const transactions = [
    {
      billingAccountId: '7190937e-e176-4d50-ae4f-c00c5e76938a',
      accountNumber: 'B12345678A',
      name: 'DEBIT',
      credit: false,
      status: 'TO_BE_OVERWRITTEN',
      purposes: ['foo']
    }
  ]

  const billLicence = {
    id: '8affaa71-c185-4b6c-9814-4c615c235611'
  }

  describe('when the service is called', () => {
    it('returns reversing transactions', () => {
      const result = ReverseTransactionsService.go(transactions, billLicence)

      expect(result).to.have.length(transactions.length)

      expect(result[0].billingAccountId).not.to.exist()
      expect(result[0].accountNumber).not.to.exist()

      expect(result[0].name).to.equal('DEBIT')
      expect(result[0].credit).to.be.true()
      expect(result[0].status).to.equal('candidate')
      expect(result[0].billLicenceId).to.equal(billLicence.id)
      expect(result[0].id).to.exist().and.to.be.a.string()
      expect(result[0].purposes).to.equal('foo')
    })
  })
})
