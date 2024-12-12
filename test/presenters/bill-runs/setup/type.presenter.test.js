'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const TypePresenter = require('../../../../app/presenters/bill-runs/setup/type.presenter.js')

describe('Bill Runs - Setup - Type presenter', () => {
  let session

  describe('when provided with a bill run setup session record', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {}
      }
    })

    describe('where the user has not previously selected a bill run type', () => {
      it('correctly presents the data', () => {
        const result = TypePresenter.go(session)

        expect(result).to.equal({
          pageTitle: 'Select the bill run type',
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedType: null
        })
      })
    })

    describe('where the user has previously selected a bill run type', () => {
      beforeEach(() => {
        session.type = 'annual'
      })

      it('correctly presents the data', () => {
        const result = TypePresenter.go(session)

        expect(result).to.equal({
          pageTitle: 'Select the bill run type',
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedType: 'annual'
        })
      })
    })
  })
})
