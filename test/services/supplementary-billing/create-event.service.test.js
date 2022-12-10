'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const CreateEventService = require('../../../app/services/supplementary-billing/create-event.service.js')

describe('Create Event service', () => {
  const type = 'billing-batch'
  const subtype = 'supplementary'
  const issuer = 'test.user@defra.gov.uk'
  const metadata = {
    batch: {
      id: '744c307f-904f-43c4-9458-24f062381d02',
      type: 'supplementary',
      region: {
        id: 'bd114474-790f-4470-8ba4-7b0cc9c225d7'
      },
      scheme: 'sroc'
    }
  }
  const status = 'start'

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  it('creates an event record', async () => {
    const result = await CreateEventService.go(type, subtype, issuer, metadata, status)

    expect(result.type).to.equal(type)
    expect(result.subtype).to.equal(subtype)
    expect(result.issuer).to.equal(issuer)
    expect(result.metadata).to.equal(metadata)
    expect(result.status).to.equal(status)
  })
})
