'use strict'

const { describe, it, beforeEach } = require('@jest/globals')
const { expect } = require('@jest/globals')

// Thing under test
const CreateBillRunPresenter = require('../../../app/presenters/billing/create-bill-run.presenter.js')

describe('Create Bill Run presenter', () => {
  let data

  describe('when provided with a populated bill run', () => {
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
      const result = CreateBillRunPresenter.go(data)

      expect(result.id).toEqual(data.billingBatchId)
      expect(result.region).toEqual(data.regionId)
      expect(result.scheme).toEqual(data.scheme)
      expect(result.status).toEqual(data.status)
      expect(result.externalId).toEqual(data.externalId)
      expect(result.errorCode).toEqual(data.errorCode)
    })
  })

  describe('when provided with unpopulated bill run', () => {
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
      const result = CreateBillRunPresenter.go(data)

      expect(result.id).toBeNull()
      expect(result.region).toBeNull()
      expect(result.scheme).toBeNull()
      expect(result.status).toBeNull()
      expect(result.externalId).toBeNull()
      expect(result.errorCode).toBeNull()
    })
  })
})
