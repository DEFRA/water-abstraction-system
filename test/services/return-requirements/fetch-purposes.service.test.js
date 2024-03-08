'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const SessionHelper = require('../../support/helpers/session.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')

// Thing under test
const FetchPurposesService = require('../../../app/services/return-requirements/fetch-purposes.service.js')

describe.only('Fetch purposes service', () => {
  let session
  let purposes
  let purposeDescription

  beforeEach(async () => {
    await DatabaseHelper.clean()

    purposes = PurposeHelper.defaults()
    purposeDescription = purposes.description
    console.log('🚀🚀🚀 ~ purposeDescription:', purposeDescription)
  })

  describe('when called', () => {
  })
})
