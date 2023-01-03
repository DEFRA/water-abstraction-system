'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CreateBillingBatchPresenter = require('../../../app/presenters/supplementary-billing/create-billing-batch.presenter.js')

describe('Create Billing Batch presenter', () => {
  let data

  describe('when provided with a populated billing batch', () => {
    beforeEach(() => {
      data = {
        billingBatchId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        regionId: '6a472535-145c-4170-ab59-f555783fa6e7',
        scheme: 'sroc',
        status: 'processing'
      }
    })

    it('correctly presents the data', () => {
      const result = CreateBillingBatchPresenter.go(data)

      expect(result.id).to.equal(data.billingBatchId)
      expect(result.region).to.equal(data.regionId)
      expect(result.scheme).to.equal(data.scheme)
      expect(result.status).to.equal(data.status)
    })
  })

  describe('when provided with unpopulated billing batch', () => {
    beforeEach(() => {
      data = {
        billingBatchId: null,
        regionId: null,
        scheme: null,
        status: null
      }
    })

    it('correctly presents the data', () => {
      const result = CreateBillingBatchPresenter.go(data)

      expect(result.id).to.be.null()
      expect(result.region).to.be.null()
      expect(result.scheme).to.be.null()
      expect(result.status).to.be.null()
    })
  })
})
