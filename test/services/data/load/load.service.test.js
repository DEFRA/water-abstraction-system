'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeReferenceModel = require('../../../../app/models/charge-reference.model.js')
const ExpandedError = require('../../../../app/errors/expanded.error.js')
const RegionModel = require('../../../../app/models/region.model.js')
const { db } = require('../../../../db/db.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const LoadService = require('../../../../app/services/data/load/load.service.js')

describe('Load service', () => {
  let payload
  let regionId

  beforeEach(() => {
    regionId = generateUUID()
  })

  describe('when the service is called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          regions: [
            {
              id: regionId,
              chargeRegionId: 'S',
              naldRegionId: 9,
              displayName: 'Test Region',
              name: 'Test Region'
            }
          ],
          billRuns: [
            {
              regionId,
              scheme: 'sroc',
              status: 'sent'
            }
          ]
        }
      })

      it('loads the entities into the DB', async () => {
        const { billRuns } = await LoadService.go(payload)

        const region = await RegionModel.query().findById(regionId)

        expect(region.displayName).to.equal('Test Region')

        const billRun = await BillRunModel.query().findById(billRuns[0])

        expect(billRun.regionId).to.equal(regionId)
        expect(billRun.status).to.equal('sent')
      })

      it('returns the generated and used IDs for the entities', async () => {
        const result = await LoadService.go(payload)

        expect(result.regions).to.exist()
        expect(result.regions).not.to.be.empty()

        expect(result.billRuns).to.exist()
        expect(result.billRuns).not.to.be.empty()
      })

      describe('that includes an entity instance with a lookup', () => {
        let chargeCategoryId

        beforeEach(async () => {
          const { id } = await ChargeCategoryHelper.add({ reference: '4.2.1' })

          chargeCategoryId = id

          payload = {
            chargeReferences: [
              {
                id: 'fa3c73d0-0459-41f0-b6cf-0e0758775ca4',
                chargeVersionId: '8e5626ee-5e4c-48f6-a668-471d35997e2c',
                description: 'SROC Charge Reference 01',
                chargeCategoryId: { schema: 'public', table: 'chargeCategories', lookup: 'reference', value: '4.2.1', select: 'id' }
              }
            ]
          }
        })

        it('transforms the lookup into the queried value', async () => {
          await LoadService.go(payload)

          const chargeReference = await ChargeReferenceModel.query().findById('fa3c73d0-0459-41f0-b6cf-0e0758775ca4')

          expect(chargeReference.chargeCategoryId).to.equal(chargeCategoryId)
        })
      })

      describe('that includes an entity with an "is_test" field', () => {
        it('sets the "is_test" flag on the entity instance as part of loading it', async () => {
          const result = await LoadService.go(payload)

          const region = await db('regions').withSchema('water').first('isTest').where('regionId', result.regions[0])

          expect(region.isTest).to.be.true()
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = { cats: [{ id: '72991007-3be7-4cd1-98b4-9ed54547e8c7', name: 'Tom' }] }
      })

      it('throws an exception', async () => {
        const result = await expect(LoadService.go(payload)).to.reject()

        expect(result).to.be.instanceOf(ExpandedError)
        expect(result.entityKey).to.equal('cats')
      })
    })

    describe('with an empty payload', () => {
      it('returns an empty result', async () => {
        const result = await LoadService.go(null)

        expect(result).to.equal({})
      })
    })
  })
})
