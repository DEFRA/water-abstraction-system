'use strict'

/**
 * Export converted data to a temporary file
 * @module WriteTableToFileService
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
 *  @param {String} schemaFolderPath The folder path of the schema
 *  @param {String} tableName The name of the table
 */
async function go (data, schemaFolderPath, tableName) {
  const filePath = await _filenameWithPath(tableName, schemaFolderPath)
  const writeToFileStream = fs.createWriteStream(filePath, { flags: 'a' })
  const promisifiedPipeline = util.promisify(pipeline)

  const inputStream = data.rows

  const transformDataStream = _transformDataStream()

  const headers = ConvertToCSVService.go(data.headers)
  writeToFileStream.write(headers)

  await promisifiedPipeline(inputStream, transformDataStream, writeToFileStream)
}

/**
 * Creates and returns a Transform stream that converts incoming objects to CSV rows
 *
 * @returns {Transform} A transform stream with objectMode set to true
 */
function _transformDataStream () {
  return new Transform({
    objectMode: true,
    transform: function (row, _encoding, callback) {
      const datRow = ConvertToCSVService.go(Object.values(row))
      callback(null, datRow)
    }
  })
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
