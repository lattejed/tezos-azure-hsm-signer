
module.exports = {

  unpackAzureKey: function(key) {
    let comps = key.kid.split('/')
    let keysIdx = comps.indexOf('keys')
    return {
      name: comps[keysIdx + 1],
      version: comps[keysIdx + 2]
    }
  },

  filterActiveAzureKeys: function(keys, validCrv, validKty) {
    return keys.map((versions) => {
      let active = versions.filter((k) => {
        return k.attributes.enabled === true
          && k.crv === validCrv && k.kty === validKty
      })
      let newest = active.sort((a, b) => {
        return b.attributes.created - a.attributes.created
      })[0]
      return newest
    })
  }

}
