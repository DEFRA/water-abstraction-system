'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const GenerateMockDataService = require('../../../../app/services/data/mock/generate-mock-data.service.js')

describe('Generate Bill Run service', () => {
  describe('when called', () => {
    it('generates a fake name', () => {
      const result = GenerateMockDataService.go()

      expect(result.name).to.exist()
      expect(result.name).to.be.a.string()
    })

    it('generates a fake address', () => {
      const result = GenerateMockDataService.go()

      expect(result.address).to.exist()
      expect(result.address).to.be.an.array()
      expect(result.address).to.have.length(3)
      expect(result.address[0]).to.be.a.string()
    })
  })
})
