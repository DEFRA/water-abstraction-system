'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ServiceStatusService = require('../../app/services/service_status.service.js')

const firstRow = [
  { text: 'Cell 1.1' },
  { text: 'Cell 1.2' },
  { text: 'Cell 1.3' },
  { text: 'Cell 1.4' },
  { text: 'Cell 1.5' }
]

const secondRow = [
  { text: 'Cell 2.1' },
  { text: 'Cell 2.2' },
  { text: 'Cell 2.3' },
  { text: 'Cell 2.4' },
  { text: 'Cell 2.5' }
]

describe('Service Status service', () => {
  describe('importRows data', () => {
    it('returns data in the expected format', async () => {
      const { importRows } = await ServiceStatusService.go()

      expect(importRows).to.equal([
        firstRow,
        secondRow
      ])
    })
  })
})
