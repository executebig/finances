const PATH_DICT = {}

// generates random forwarding path
const generatePath = (fileName) => {
  const fwdPath =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  PATH_DICT[fwdPath] = fileName

  return fwdPath
}

const getPath = (pathName) => {
    console.log(PATH_DICT)
    realPath = PATH_DICT[pathName]
    console.log(realPath)
    delete PATH_DICT[pathName]

    return realPath
}

module.exports = {generatePath, getPath}