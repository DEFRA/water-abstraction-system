'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers

// Thing under test
const RecipientsService = require('../../../../app/services/notifications/setup/recipients.service.js')

describe.only('Notifications Setup - Recipients service', () => {
  let dueDate
  let isSummer

  beforeEach(() => {
    dueDate = '2024-12-01'

    isSummer = 'true'
  })

  describe('when provided no params', () => {
    it('correctly presents the data', async () => {
      const result = await RecipientsService.go(dueDate, isSummer)

      expect(result).to.equal([])
    })
  })
})
