'use strict'

/**
 * Export converted data to a temporary file
 * @module WriteStreamToFileService
 */

const fs = require('fs')
const fsPromises = fs.promises
const { pipeline, Transform } = require('stream')
const path = require('path')
const util = require('util')

const ConvertToCSVService = require('./convert-to-csv.service.js')

/**
 * Converts data into CSV format and writes it to a file
 *  @param {Object} data The knex query to fetch the table
 * @param {String} schemaFolderPath The folder path of the schema
 */
async function go (data, schemaFolderPath) {
  const filePath = await _filenameWithPath(data.tableName, schemaFolderPath)
  const writeToFileStream = fs.createWriteStream(filePath, { flags: 'a' })
  const promisifiedPipeline = util.promisify(pipeline)

  const inputStream = data.rows

  const transformDataStream = new Transform({

    objectMode: true,

    transform: function (array, _encoding, callback) {
      const datRow = (ConvertToCSVService.go(Object.values(array)))
      callback(null, datRow)
    }
  })

  const headers = ConvertToCSVService.go(data.headers)
  writeToFileStream.write(headers)

  await promisifiedPipeline(inputStream, transformDataStream, writeToFileStream)
}

/**
 * Returns a file path by joining the schema folder path with the file name.
 * The schema path has already been created with the temporary directory
 *
 * @param {String} tableName The name of the table
 * @param {String} schemaFolderPath The folder path of the schema
 *
 * @returns {String} The full file path
 */
async function _filenameWithPath (tableName, schemaFolderPath) {
  await fsPromises.mkdir(schemaFolderPath, { recursive: true })

  return path.normalize(
    path.format({
      dir: schemaFolderPath,
      name: `${tableName}.csv`
    })
  )
}

module.exports = {
  go
}
