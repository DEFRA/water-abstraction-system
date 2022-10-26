'use strict'

/**
 * @module ServiceStatusService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const util = require('util')
const exec = util.promisify(require('child_process').exec)

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

  static async _getImportData (got) {
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

    // TODO move the URL into config
    const response = await got.get('http://localhost:8007/health/info').json()

    return {
      name: 'Import',
      version: response.version,
      commit: response.commit,
      jobs
    }
  }

  static async _getAppData (got) {
    const services = [
      { name: 'Service - foreground', url: new URL('/health/info', servicesConfig.serviceForeground.url) },
      { name: 'Service - background', url: new URL('/health/info', servicesConfig.serviceBackground.url) },
      { name: 'Reporting', url: new URL('/health/info', servicesConfig.reporting.url) },
      { name: 'Import', url: new URL('/health/info', servicesConfig.import.url) },
      { name: 'Tactical CRM', url: new URL('/health/info', servicesConfig.tacticalCrm.url) },
      { name: 'External UI', url: new URL('/health/info', servicesConfig.externalUi.url) },
      { name: 'Internal UI', url: new URL('/health/info', servicesConfig.internalUi.url) },
      { name: 'Tactical IDM', url: new URL('/health/info', servicesConfig.tacticalIdm.url) },
      { name: 'Permit repository', url: new URL('/health/info', servicesConfig.permitRepository.url) },
      { name: 'Returns', url: new URL('/health/info', servicesConfig.returns.url) }
    ]

    for (const service of services) {
      const response = await got.get(service.url).json()
      service.version = response.version
      service.commit = response.commit
    }

    return services
  }
}

module.exports = ServiceStatusService
