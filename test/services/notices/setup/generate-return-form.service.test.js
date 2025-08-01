'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const GenerateReturnFormService = require('../../../../app/services/notices/setup/generate-return-form.service.js')

describe('Notice - Setup - Generate Return Form Service', () => {
  let pageData

  beforeEach(() => {
    pageData = {
      title: 'test file',
      cover: {
        title: 'test cover'
      }
    }
  })

  describe('when the request can create a file', () => {
    it('returns a "true" success status', async () => {
      const result = await GenerateReturnFormService.go(pageData)

      expect(result).to.equal(
        '<!DOCTYPE html>\n' +
          '<html>\n' +
          '<head>\n' +
          '  <title>test file</title>\n' +
          '</head>\n' +
          '<body>\n' +
          '<h1>test cover</h1>\n' +
          '<p>This is a Nunjucks-rendered HTML page.</p>\n' +
          '</body>\n' +
          '</html>\n'
      )
    })
  })
})
