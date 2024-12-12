'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CreateBillRunPresenter = require('../../../app/presenters/bill-runs/create-bill-run.presenter.js')

describe('Create Bill Run presenter', () => {
  let data

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      data = {
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        regionId: '6a472535-145c-4170-ab59-f555783fa6e7',
        scheme: 'sroc',
        status: 'processing',
        externalId: '2bbbe459-966e-4026-b5d2-2f10867bdddd',
        errorCode: 123
      }
    })

    it('correctly presents the data', () => {
      const result = CreateBillRunPresenter.go(data)

      expect(result.billingBatchId).to.equal(data.id)
      expect(result.region).to.equal(data.regionId)
      expect(result.scheme).to.equal(data.scheme)
      expect(result.status).to.equal(data.status)
      expect(result.externalId).to.equal(data.externalId)
      expect(result.errorCode).to.equal(data.errorCode)
    })
  })

  describe('when provided with unpopulated bill run', () => {
    beforeEach(() => {
      data = {
        id: null,
        regionId: null,
        scheme: null,
        status: null,
        externalId: null,
        errorCode: null
      }
    })

    it('correctly presents the data', () => {
      const result = CreateBillRunPresenter.go(data)

      expect(result.billingBatchId).to.be.null()
      expect(result.region).to.be.null()
      expect(result.scheme).to.be.null()
      expect(result.status).to.be.null()
      expect(result.externalId).to.be.null()
      expect(result.errorCode).to.be.null()
    })
  })
})
