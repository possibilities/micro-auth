const find = require('lodash.find')
const uuid = require('uuid')

const memory = () => {
  const _inMemoryBackend = {}

  return {
    save (type, data) {
      if (!_inMemoryBackend[type]) {
        _inMemoryBackend[type] = {}
      }

      const id = uuid()
      const savedData = Object.assign({}, { id }, data)

      // persist
      _inMemoryBackend[type][id] = savedData

      return Promise.resolve(savedData)
    },

    find (type, query) {
      if (!_inMemoryBackend[type]) {
        _inMemoryBackend[type] = {}
      }

      const items = Object.keys(_inMemoryBackend[type]).map(id => {
        return _inMemoryBackend[type][id]
      })

      const item = find(items, query)

      return Promise.resolve(item)
    }
  }
}

module.exports = memory
