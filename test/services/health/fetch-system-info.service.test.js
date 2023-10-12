'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { version } = require('../../../package.json')

// Thing under test
const FetchSystemInfoService = require('../../../app/services/health/fetch-system-info.service.js')

describe.only('Fetch System Info service', () => {
  it('returns the systems version and commit hash', async () => {
    const result = await FetchSystemInfoService.go()

    expect(result.version).to.equal(version)
    expect(result.commit).to.exist()
  })
})
