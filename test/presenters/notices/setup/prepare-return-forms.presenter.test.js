'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PrepareReturnFormsPresenter = require('../../../../app/presenters/notices/setup/prepare-return-forms.presenter.js')

describe('Notices - Setup - Prepare Return Forms Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PrepareReturnFormsPresenter.go(session)

      expect(result).to.equal({
        address: {
          addressLine1: 'Sherlock Holmes',
          addressLine2: '221B Baker Street',
          addressLine3: 'London',
          addressLine4: 'NW1 6XE',
          addressLine5: 'United Kingdom'
        },
        description: 'mock site',
        dueDate: '1 October 2023',
        endDate: '30 September 2023',
        formatId: 'format id 123',
        licenceRef: '123',
        purpose: 'a purpose',
        regionAndArea: 'A place / in the sun',
        returnRef: '7646',
        startDate: '1 September 2023',
        title: 'Water abstraction daily return',
        twoPartTariff: true
      })
    })
  })
})
