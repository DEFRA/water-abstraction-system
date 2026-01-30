'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckPageLib = require('../../app/lib/check-page.lib.js')

describe('CheckPage Lib', () => {
  let session

  beforeEach(() => {
    session = {
      $update: Sinon.stub().resolves(1),
      checkPageVisited: false,
      // We want to ensure the functions do not modify the rest of the session data
      extraSessionData: 'some extra data'
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#checkUrl', () => {
    describe('when the page has been visited', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('should return updated url', () => {
        const result = CheckPageLib.checkUrl(session, '/system/name')

        expect(result).to.equal('/system/check')
      })
    })

    describe('when the page has not been visited', () => {
      it('should return updated url', () => {
        const result = CheckPageLib.checkUrl(session, '/system/name')

        expect(result).to.equal('/system/name')
      })
    })
  })

  describe('#markCheckPageVisited', () => {
    it('should only update the "checkPageVisited" property to true', async () => {
      await CheckPageLib.markCheckPageVisited(session)

      expect(session).to.equal({
        $update: session.$update,
        checkPageVisited: true,
        extraSessionData: 'some extra data'
      })
    })
  })

  describe('#markCheckPageNotVisited', () => {
    it('should only update the "checkPageVisited" property to false', async () => {
      await CheckPageLib.markCheckPageNotVisited(session)

      expect(session).to.equal({
        $update: session.$update,
        checkPageVisited: false,
        extraSessionData: 'some extra data'
      })
    })
  })
})
