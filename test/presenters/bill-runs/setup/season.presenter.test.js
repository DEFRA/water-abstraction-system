'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const SeasonPresenter = require('../../../../app/presenters/bill-runs/setup/season.presenter.js')

describe('Bill Runs Setup Season presenter', () => {
  let session

  describe('when provided with a bill run setup session record', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {}
      }
    })

    describe('where the user has not previously selected a season', () => {
      it('correctly presents the data', () => {
        const result = SeasonPresenter.go(session)

        expect(result).to.equal({
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedSeason: null
        })
      })
    })

    describe('where the user has previously selected a season', () => {
      beforeEach(() => {
        session.season = 'summer'
      })

      it('correctly presents the data', () => {
        const result = SeasonPresenter.go(session)

        expect(result).to.equal({
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedSeason: 'summer'
        })
      })
    })
  })
})
