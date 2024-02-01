'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SelectReasonPresenter = require('../../../app/presenters/return-requirements/reason.presenter.js')
const { selectReasonFields } = require('../../../app/lib/static-lookups.lib.js')

describe('Select Reeason presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
      data: {
        licence: {
          id: 'ea53bfc6-740d-46c5-9558-fc8cabfc6c1f',
          licenceRef: '01/123',
          licenceHolder: 'Jane Doe'
        }
      }
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = SelectReasonPresenter.go(session)

      expect(result).to.equal({
        errorMessage: null,
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        licenceRef: '01/123',
        radioItems: [
          {
            value: selectReasonFields[0],
            text: 'Change to special agreement',
            checked: false
          },
          {
            value: selectReasonFields[1],
            text: 'Licence holder name or address change',
            checked: false
          },
          {
            value: selectReasonFields[2],
            text: 'Licence transferred and now chargeable',
            checked: false
          },
          {
            value: selectReasonFields[3],
            text: 'Limited extension of licence validity (LEV)',
            checked: false
          },
          {
            value: selectReasonFields[4],
            text: 'Major change',
            checked: false
          },
          {
            value: selectReasonFields[5],
            text: 'Minor change',
            checked: false
          },
          {
            value: selectReasonFields[6],
            text: 'New licence in part succession or licence apportionment',
            checked: false
          },
          {
            value: selectReasonFields[7],
            text: 'New licence',
            checked: false
          },
          {
            value: selectReasonFields[8],
            text: 'New special agreement',
            checked: false
          },
          {
            value: selectReasonFields[9],
            text: 'Succession or transfer of licence',
            checked: false
          },
          {
            value: selectReasonFields[10],
            text: 'Succession to remainder licence or licence apportionment',
            checked: false
          }
        ]
      })
    })
  })

  describe('when provided with an error', () => {
    const error = new Error('Test error message')

    it('includes the error message in the presented data', () => {
      const result = SelectReasonPresenter.go(session, error)

      expect(result.errorMessage).to.exist()
      expect(result.errorMessage.text).to.equal(error.message)
    })
  })
})
