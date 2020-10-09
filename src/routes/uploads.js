const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express.Router()

const pathStore = require('@libs/pathstore')

app.get('/:path', (req, res) => {
  const realPath = pathStore.getPath(req.params.path)

  if (!realPath) {
    res.sendStatus(404)
    return
  }

  const absPath = path.join(
    __dirname,
    '../../temp/uploaded/',
    realPath
  )

  res.sendFile(absPath, (err) => {
    if (err) {
      console.log(err)
    } else {
      fs.unlink(absPath, (err) => {
        if (err) {
          console.log(err)
        }

        console.log('Deleted file at ' + absPath)
      })
    }
  })
})

module.exports = app
