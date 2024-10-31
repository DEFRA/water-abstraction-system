'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it } = require('node:test')
const { expect } = Code

// Thing under test
const FetchSystemInfoService = require('../../../app/services/health/fetch-system-info.service.js')

describe('Fetch System Info service', () => {
  it('returns the systems version and commit hash', async () => {
    const result = await FetchSystemInfoService.go()

    expect(result.name).to.equal('System')
    expect(result.serviceName).to.equal('system')
    expect(result.version).to.exist()
    expect(result.commit).to.exist()
    expect(result.jobs).to.have.length(0)
  })
})
