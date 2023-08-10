'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const MockBillRunPresenter = require('../../../app/presenters//data/mock-bill-run.presenter.js')

describe.only('Mock Bill Run presenter', () => {
  let data

  describe('when provided with a populated billing batch', () => {
    beforeEach(() => {
      data = {
        billingBatchId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        regionId: '6a472535-145c-4170-ab59-f555783fa6e7',
        scheme: 'sroc',
        status: 'processing',
        externalId: '2bbbe459-966e-4026-b5d2-2f10867bdddd',
        errorCode: 123
      }
    })

    it('correctly presents the data', () => {
      const result = MockBillRunPresenter.go(data)

      expect(result).not.to.be.undefined()
    })
  })

  describe('when provided with unpopulated billing batch', () => {
    beforeEach(() => {
      data = {
        billingBatchId: null,
        regionId: null,
        scheme: null,
        status: null,
        externalId: null,
        errorCode: null
      }
    })

    it('correctly presents the data', () => {
      const result = MockBillRunPresenter.go(data)

      expect(result).not.to.be.undefined()
    })
  })
})
