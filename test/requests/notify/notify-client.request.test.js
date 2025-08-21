'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { NotifyClient } = require('notifications-node-client')

// Things we need to stub
const notifyConfig = require('../../../config/notify.config.js')
const serverConfig = require('../../../config/server.config.js')

// Thing under test
const NotifyClientRequest = require('../../../app/requests/notify/notify-client.request.js')

describe('Notify - Client request', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when creating a notify client without a proxy', () => {
    beforeEach(() => {
      Sinon.stub(serverConfig, 'httpProxy').value(undefined)
    })

    it('should create a notify client', () => {
      const result = NotifyClientRequest.go()

      expect(result).to.equal(new NotifyClient(notifyConfig.apiKey))
    })
  })

  describe('when creating a notify client with a proxy', () => {
    beforeEach(() => {
      Sinon.stub(serverConfig, 'httpProxy').value('https://test.proxy.defra.gov.uk')
    })

    it('should create a notify client with the provided proxy url', () => {
      const result = NotifyClientRequest.go()

      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.host).to.equal('test.proxy.defra.gov.uk')
      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.hostname).to.equal('test.proxy.defra.gov.uk')
      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.href).to.equal('https://test.proxy.defra.gov.uk/')
      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.origin).to.equal('https://test.proxy.defra.gov.uk')
    })
  })
})
