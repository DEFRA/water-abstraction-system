'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ReturnsForPaperFormsService = require('../../../../app/services/notices/setup/returns-for-paper-forms.service.js')

describe('Notices - Setup - Returns For Paper Forms service', () => {
  let dueReturn
  let licenceRef
  let session
  let sessionData

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    dueReturn = {
      description: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    sessionData = { licenceRef, dueReturns: [dueReturn] }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ReturnsForPaperFormsService.go(session.id)

      expect(result).to.equal({
        pageTitle: 'Select the returns for the paper forms',
        returns: [
          {
            checked: false,
            hint: {
              text: '1 April 2002 to 31 March 2003'
            },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnId
          }
        ]
      })
    })
  })
})
