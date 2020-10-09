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
  if (PATH_DICT[pathName]) {
    realPath = PATH_DICT[pathName]
    delete PATH_DICT[pathName]

    return realPath
  } else {
    return null
  }
}

module.exports = {generatePath, getPath}