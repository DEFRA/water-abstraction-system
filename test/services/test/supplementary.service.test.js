'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const TestSupplementaryService = require('../../../app/services/test/supplementary.service.js')

describe('Test supplementary service', () => {
  it('returns a set response', async () => {
    const result = await TestSupplementaryService.go()
    expect(result).to.equal({
      chargeVersions: [
        { id: '986d5b14-8686-429e-9ae7-1164c1300f8d', licenceRef: 'AT/SROC/SUPB/01' },
        { id: 'ca0e4a77-bb13-4eef-a1a1-2ccf9e302cc4', licenceRef: 'AT/SROC/SUPB/03' }
      ]
    })
  })
})
