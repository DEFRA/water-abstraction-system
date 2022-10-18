'use strict'

/**
 * @module ServiceStatusService
 */

/**
 * Returns data required to populate our `/service-status` page, eg. task activity status, virus checker status, service
 * version numbers, etc.
 *
 * Each data set is returned in the format needed to populate the gov.uk table elements ie. an array containing one
 * array per row, where each row array contains multiple `{ text: '...' }` elements, one for each cell in the row.
*/
class ServiceStatusService {
  static async go () {
    const importData = this._getImportData()
    const virusScannerData = this._getVirusScannerData()
    const cacheConnectivityData = this._getCacheConnectivityData()
    const serviceVersionsData = this._getServiceVersionsData()

    const importRows = this._mapArrayToTextCells(importData)
    const virusScannerRows = this._mapArrayToStatusCells(virusScannerData)
    const cacheConnectivityRows = this._mapArrayToStatusCells(cacheConnectivityData)
    const serviceVersionsRows = this._mapArrayToStatusCells(serviceVersionsData)

    return {
      importRows,
      virusScannerRows,
      cacheConnectivityRows,
      serviceVersionsRows
    }
  }

  static _mapArrayToTextCells (rows) {
    // Map each row in the array we've received
    return rows.map(row => {
      // Map each cell in the row
      return row.map(cell => {
        // Return an object in the format needed to populate a table
        return { text: cell }
      })
    })
  }

  static _mapArrayToStatusCells (rows) {
    // Map each row in the array we've received
    return rows.map(row => {
      // A status row has only two elements: the first is standard text, the other is mapped as numeric to right-justify
      // it
      return [
        { text: row[0] },
        { text: row[1], format: 'numeric' }
      ]
    })
  }

  static _getImportData () {
    return [
      [
        'Cell 1.1',
        'Cell 1.2',
        'Cell 1.3',
        'Cell 1.4',
        'Cell 1.5'
      ],
      [
        'Cell 2.1',
        'Cell 2.2',
        'Cell 2.3',
        'Cell 2.4',
        'Cell 2.5'
      ]
    ]
  }

  static _getVirusScannerData () {
    return [
      [
        'Status',
        'OK'
      ]
    ]
  }

  static _getCacheConnectivityData () {
    return [
      [
        'Status',
        'Connected'
      ]
    ]
  }

  static _getServiceVersionsData () {
    return [
      [
        'Water service',
        '3.0.1'
      ],
      [
        'IDM',
        '2.25.1'
      ]
    ]
  }
}

module.exports = ServiceStatusService
