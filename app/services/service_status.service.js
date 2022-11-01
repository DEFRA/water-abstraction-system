'use strict'

/**
 * @module ServiceStatusService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const util = require('util')
const ChildProcess = require('child_process')
const exec = util.promisify(ChildProcess.exec)

const servicesConfig = require('../../config/services.config')

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

    const { got } = await import('got')
    const addressFacadeData = await this._getAddressFacadeData(got)
    const chargingModuleData = await this._getChargingModuleData(got)
    const appData = await this._getAppData(got)

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

  static async _getAddressFacadeData (got) {
    const statusUrl = new URL('/address-service/hola', servicesConfig.addressFacade.url)

    const response = await got.get(statusUrl)

    return response.body
  }

  static async _getChargingModuleData (got) {
    const statusUrl = new URL('/status', servicesConfig.chargingModule.url)

    const response = await got.get(statusUrl)

    return response.headers['x-cma-docker-tag']
  }

  static async _requestAppData (got, serviceUrl) {
    const healthInfoPath = new URL('/health/info', serviceUrl)
    const result = {}

    try {
      const response = await got.get(healthInfoPath).json()

      result.version = response.version
      result.commit = response.commit
    } catch (error) {
      console.log('I got here')
      const statusCode = error.response ? error.response.statusCode : 'N/A'
      result.version = `ERROR: ${statusCode} - ${error.name}`

      result.commit = error.message
    }

    return result
  }

  static _getImportJobsData () {
    const jobs = this._mapArrayToTextCells([
      [
        'Cell 1.1',
        'Cell 1.2'
      ],
      [
        'Cell 2.1',
        'Cell 2.2'
      ]
    ])

    return jobs
  }

  static async _getAppData (got) {
    const services = [
      { name: 'Service - foreground', url: servicesConfig.serviceForeground.url },
      { name: 'Service - background', url: servicesConfig.serviceBackground.url },
      { name: 'Reporting', url: servicesConfig.reporting.url },
      { name: 'Import', url: servicesConfig.import.url },
      { name: 'Tactical CRM', url: servicesConfig.tacticalCrm.url },
      { name: 'External UI', url: servicesConfig.externalUi.url },
      { name: 'Internal UI', url: servicesConfig.internalUi.url },
      { name: 'Tactical IDM', url: servicesConfig.tacticalIdm.url },
      { name: 'Permit repository', url: servicesConfig.permitRepository.url },
      { name: 'Returns', url: servicesConfig.returns.url }
    ]

    for (const service of services) {
      const result = await this._requestAppData(got, service.url)
      service.version = result.version
      service.commit = result.commit
      service.jobs = service.name === 'Import' ? this._getImportJobsData() : []
    }

    return services
  }
}

module.exports = ServiceStatusService
