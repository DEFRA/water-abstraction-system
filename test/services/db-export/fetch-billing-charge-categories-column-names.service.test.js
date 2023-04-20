'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const FetchBillingChargeCategoriesColumnNames = require('../../../app/services/db-export/fetch-billing-charge-categories-column-names.service.js')

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

describe.only('Fetch billing charge categories column name service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  it('returns the table column names', async () => {
    const fetchColumnInfo = await FetchBillingChargeCategoriesColumnNames.go()

    expect(fetchColumnInfo).to.equal(billingChargeCategoriescolumnInfo)
  })
})
