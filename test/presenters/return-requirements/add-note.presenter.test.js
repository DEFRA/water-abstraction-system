'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AddNotePresenter = require('../../../app/presenters/return-requirements/add-note.presenter.js')

describe.only('Add Note presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
      data: {
        licence: {
          id: 'ea53bfc6-740d-46c5-9558-fc8cabfc6c1f',
          licenceRef: '01/123',
          licenceHolder: 'Jane Doe'
        },
        note: ''
      }
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data with a note', () => {
      const result = AddNotePresenter.go(session)

      expect(result.id).to.be.equal('f1288f6c-8503-4dc1-b114-75c408a14bd0')
      expect(result.licenceRef).to.be.equal('01/123')
      expect(result.note).to.be.empty()
    })
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data without notes', () => {
      session.data.note = {
        content: 'Note attached to return requirement'
      }
      const result = AddNotePresenter.go(session)

      expect(result.id).to.be.equal('f1288f6c-8503-4dc1-b114-75c408a14bd0')
      expect(result.licenceRef).to.be.equal('01/123')
      expect(result.note).to.be.equal('Note attached to return requirement')
    })
  })
})
