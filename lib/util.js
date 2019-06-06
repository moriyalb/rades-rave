"use strict"

const Util = module.exports
const _ = require("lodash")
const R = require("ramda")

Util.checkTable = function(tbl) {
	return !!tbl && _.isString(tbl) && /^[a-zA-Z_]+[a-zA-Z0-9_]*$/.test(tbl)
}

Util.checkKey = function(keys) {
	return !!keys && _.isArray(keys) && R.all(_.isString, keys)
}

Util.checkKeyValue = function(keys) {
	return !!keys && _.isArray(keys) && R.all(R.either(_.isString, _.isInteger), keys)
}

Util.checkDatas = function(datas) {
	return !!datas && _.isArray(datas) && R.all(_.isPlainObject, datas)
}