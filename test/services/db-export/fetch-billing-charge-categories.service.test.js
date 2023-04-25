'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const FetchBillingChargeCategoriesService = require('../../../app/services/db-export/fetch-billing-charge-categories.service.js')

const billingChargeCategoriescolumnInfo = {
  billingChargeCategoryId:
    {
      type: 'uuid',
      maxLength: null,
      nullable: false,
      defaultValue: 'gen_random_uuid()'
    },
  reference:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  subsistenceCharge:
  {
    type: 'integer',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  description:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  shortDescription:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  dateCreated:
  {
    type: 'timestamp without time zone',
    maxLength: null,
    nullable: false,
    defaultValue: null
  },
  dateUpdated:
  {
    type: 'timestamp without time zone',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  isTidal:
  {
    type: 'boolean',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  lossFactor:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  modelTier:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  isRestrictedSource:
  {
    type: 'boolean',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  minVolume:
  {
    type: 'bigint',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  maxVolume:
  {
    type: 'bigint',
    maxLength: null,
    nullable: true,
    defaultValue: null
  }
}

describe('Fetch Billing charge categories service', () => {
  let billingChargeCategory

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingChargeCategory = await BillingChargeCategoryHelper.add()
    await BillingChargeCategoryHelper.add()
  })

  describe('when we connect to the db', () => {
    it('returns the table column names', async () => {
      const results = await FetchBillingChargeCategoriesService.go()

      expect(results[0]).to.equal(billingChargeCategoriescolumnInfo)
    })

    it('returns all records in the billing-charge-categories table', async () => {
      const results = await FetchBillingChargeCategoriesService.go()

      expect(results[1][0].billingChargeCategoryId).to.equal(billingChargeCategory.billingChargeCategoryId)
      expect(results[1][1].subsistenceCharge).to.equal(billingChargeCategory.subsistenceCharge)
      expect(results[1]).to.have.length(2)
    })
  })
})
