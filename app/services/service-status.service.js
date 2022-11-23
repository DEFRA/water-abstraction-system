'use strict'

/**
 * Checks status, including versions, of the various services which make up WRLS
 * @module ServiceStatusService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const ChildProcess = require('child_process')
const util = require('util')
const exec = util.promisify(ChildProcess.exec)

const servicesConfig = require('../../config/services.config.js')

/**
 * Returns data required to populate our `/service-status` page, eg. task activity status, virus checker status, service
 * version numbers, etc.
 *
 * Each data set is returned in the format needed to populate the gov.uk table elements ie. an array containing one
 * array per row, where each row array contains multiple `{ text: '...' }` elements, one for each cell in the row.
*/
class ServiceStatusService {
  static async go () {
    const virusScannerData = await this._getVirusScannerData()
    const redisConnectivityData = await this._getRedisConnectivityData()

    const addressFacadeData = await this._getAddressFacadeData()
    const chargingModuleData = await this._getChargingModuleData()
    const appData = await this._getAppData()

    return {
      virusScannerData,
      redisConnectivityData,
      addressFacadeData,
      chargingModuleData,
      appData
    }
  }

  /**
   * Receives an array and returns it in the format required by the nunjucks template in the view.
   */
  static _mapArrayToTextCells (rows) {
    return rows.map(row => {
      return row.map(cell => {
        return { text: cell }
      })
    })
  }

  static async _getVirusScannerData () {
    try {
      const { stdout, stderr } = await exec('clamdscan --version')
      return stderr ? `ERROR: ${stderr}` : stdout
    } catch (error) {
      return `ERROR: ${error.message}`
    }
  }

  static async _getRedisConnectivityData () {
    try {
      const { stdout, stderr } = await exec('redis-server --version')
      return stderr ? `ERROR: ${stderr}` : stdout
    } catch (error) {
      return `ERROR: ${error.message}`
    }
  }

  static async _getAddressFacadeData () {
    const statusUrl = new URL('/address-service/hola', servicesConfig.addressFacade.url)
    const result = await this._requestData(statusUrl)

    return result.succeeded ? result.response.body : result.response
  }

  static async _getChargingModuleData () {
    const statusUrl = new URL('/status', servicesConfig.chargingModule.url)
    const result = await this._requestData(statusUrl)

    return result.succeeded ? result.response.headers['x-cma-docker-tag'] : result.response
  }

  static async _requestData (url) {
    // As of v12, the got dependency no longer supports CJS modules. This causes us a problem as we are locked into
    // using these for the time being. Some workarounds are provided here: https://github.com/sindresorhus/got/issues/1789
    // We have gone the route of using await import('got'). We cannot do this at the top level as Node doesn't support
    // top level in CJS so we do it here instead.
    const { got } = await import('got')
    const result = {
      succeeded: true,
      response: null
    }

    try {
      result.response = await got.get(url, {
        retry: {
          // We ensure that the only network errors Got retries are timeout errors
          errorCodes: ['ETIMEDOUT'],
          // We set statusCodes as an empty array to ensure that 4xx, 5xx etc. errors are not retried
          statusCodes: []
        }
      })
    } catch (error) {
      const statusCode = error.response ? error.response.statusCode : 'N/A'
      result.response = `ERROR: ${statusCode} - ${error.name} - ${error.message}`
      result.succeeded = false
    }

    return result
  }

  static _getImportJobsData () {
    return this._mapArrayToTextCells([
      [
        'Cell 1.1',
        'Cell 1.2'
      ],
      [
        'Cell 2.1',
        'Cell 2.2'
      ]
    ])
  }

  static async _getAppData () {
    const healthInfoPath = '/health/info'
    const services = [
      { name: 'Service - foreground', url: new URL(healthInfoPath, servicesConfig.serviceForeground.url) },
      { name: 'Service - background', url: new URL(healthInfoPath, servicesConfig.serviceBackground.url) },
      { name: 'Reporting', url: new URL(healthInfoPath, servicesConfig.reporting.url) },
      { name: 'Import', url: new URL(healthInfoPath, servicesConfig.import.url) },
      { name: 'Tactical CRM', url: new URL(healthInfoPath, servicesConfig.tacticalCrm.url) },
      { name: 'External UI', url: new URL(healthInfoPath, servicesConfig.externalUi.url) },
      { name: 'Internal UI', url: new URL(healthInfoPath, servicesConfig.internalUi.url) },
      { name: 'Tactical IDM', url: new URL(healthInfoPath, servicesConfig.tacticalIdm.url) },
      { name: 'Permit repository', url: new URL(healthInfoPath, servicesConfig.permitRepository.url) },
      { name: 'Returns', url: new URL(healthInfoPath, servicesConfig.returns.url) }
    ]

    for (const service of services) {
      const result = await this._requestData(service.url)

      if (result.succeeded) {
        const data = JSON.parse(result.response.body)
        service.version = data.version
        service.commit = data.commit
        service.jobs = service.name === 'Import' ? this._getImportJobsData() : []
      } else {
        service.version = result.response
        service.commit = ''
      }
    }

    return services
  }
}

module.exports = ServiceStatusService
