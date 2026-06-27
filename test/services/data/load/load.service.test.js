'use strict'

// Test helpers
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeReferenceModel = require('../../../../app/models/charge-reference.model.js')
const { db } = require('../../../../db/db.js')
const ExpandedError = require('../../../../app/errors/expanded.error.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const LoadService = require('../../../../app/services/data/load/load.service.js')

describe('Load service', () => {
  let licenceRef
  let payload
  let region

  beforeEach(() => {
    licenceRef = LicenceHelper.generateLicenceRef()
    region = RegionHelper.select()
  })

  describe('when the service is called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          licences: [
            {
              licenceRef,
              regionId: region.id,
              regions: {
                historicalAreaCode: 'SAAR',
                regionalChargeArea: region.name
              },
              startDate: '2020-01-01',
              waterUndertaker: false
            }
          ],
          billRuns: [
            {
              regionId: region.id,
              scheme: 'sroc',
              status: 'sent'
            }
          ]
        }
      })

      it('loads the entities into the DB', async () => {
        const { billRuns, licences } = await LoadService.go(payload)

        const licence = await LicenceModel.query().findById(licences[0])

        expect(licence.licenceRef).toEqual(licenceRef)

        const billRun = await BillRunModel.query().findById(billRuns[0])

        expect(billRun.regionId).toEqual(region.id)
        expect(billRun.status).toEqual('sent')
      })

      it('returns the generated and used IDs for the entities', async () => {
        const result = await LoadService.go(payload)

        expect(result.licences).toBeDefined()
        expect(result.licences).not.toHaveLength(0)

        expect(result.billRuns).toBeDefined()
        expect(result.billRuns).not.toHaveLength(0)
      })

      describe('that includes an entity instance with a lookup', () => {
        let chargeCategory

        beforeEach(() => {
          chargeCategory = ChargeCategoryHelper.select()

          payload = {
            chargeReferences: [
              {
                id: 'fa3c73d0-0459-41f0-b6cf-0e0758775ca4',
                chargeVersionId: '8e5626ee-5e4c-48f6-a668-471d35997e2c',
                description: 'SROC Charge Reference 01',
                chargeCategoryId: {
                  schema: 'public',
                  table: 'chargeCategories',
                  lookup: 'reference',
                  value: chargeCategory.reference,
                  select: 'id'
                }
              }
            ]
          }
        })

        it('transforms the lookup into the queried value', async () => {
          await LoadService.go(payload)

          const chargeReference = await ChargeReferenceModel.query().findById('fa3c73d0-0459-41f0-b6cf-0e0758775ca4')

          expect(chargeReference.chargeCategoryId).toEqual(chargeCategory.id)
        })
      })

      describe('that includes an entity with an "is_test" field', () => {
        it('sets the "is_test" flag on the entity instance as part of loading it', async () => {
          const result = await LoadService.go(payload)

          const licence = await db('licences')
            .withSchema('water')
            .first('isTest')
            .where('licenceId', result.licences[0])

          expect(licence.isTest).toBe(true)
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = { cats: [{ id: '72991007-3be7-4cd1-98b4-9ed54547e8c7', name: 'Tom' }] }
      })

      it('throws an exception', async () => {
        const result = await LoadService.go(payload).catch((e) => {
          return e
        })

        expect(result).toBeInstanceOf(ExpandedError)
        expect(result.entityKey).toEqual('cats')
      })
    })

    describe('with an empty payload', () => {
      it('returns an empty result', async () => {
        const result = await LoadService.go(null)

        expect(result).toEqual({})
      })
    })
  })
})
