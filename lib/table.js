"use strict"

const _ = require("lodash")
const R = require("ramda")

class RaveTable {
	constructor(tbl) {
		this.size = 0
		this.keys = null
		this.tblName = tbl
		this.datas = {}
		this.isDirty = false
	}

	reload(info, djsoned) {
		let datas = JSON.parse(djsoned)
		this.keys = info.keys
		if (!this.keys || this.keys.length == 0){
			throw new Error(`<rave:table:reload> failed: Invalid table key ${info.keys} for table ${this.tblName}`)
		} 
		this.size = djsoned.length
		if (this.size != info.size){
			//maybe md5 later
			console.log(this.size, info.size)
			console.warn(`<rave:table:reload> warn: Did you try modify rave table by hand ? Don't do this or you may destroy the datas `)
		}
		this._setDatas(datas)
	}

	reInit(keys) {
		this.keys = keys
		let datas = this.serialize()
		this.datas.clear()
		this._setDatas(datas)
	}

	serialize() {
		let values = this._pack(this.datas)
		let jsoned = JSON.stringify(values)
		this.size = jsoned.length
		return jsoned
	}

	_pack(datas, path_len = 0) {
		let realValues = [datas]
		for (let i = path_len; i < this.keys.length; ++i){
			realValues = R.unnest(R.map(R.values, realValues))
		}
		return realValues
	}

	insert(datas) {
		if (!datas || datas.length == 0) return
		for (let d of datas) {
			let dkeys = this._getKeys(d)
			let v = R.path(dkeys, this.datas)
			if (!!v){								
				d = R.mergeDeepRight(v, d)				
			}
			this.datas = R.assocPath(dkeys, d, this.datas)
		}
		this.isDirty = true
	}

	select(keys) {
		if (keys.length > this.keys.length) {
			throw new Error(`<rave:table:select> error: Invalid input keys ${keys}`)
		}
		let datas = R.path(keys, this.datas)
		if (!datas) return []
		return this._pack(datas, keys.length)
	}

	selectAllKeys(keys) {
		if (keys.length >= this.keys.length) {
			throw new Error(`<rave:table:selectAllKeys> error: Invalid input keys ${keys}`)
		}

		let values = this.datas
		for (let k of keys){
			values = values[k]
		}
		if (!values) return []

		let convertKeys = R.values(values)
		for (let i = 0; i < this.keys.length - keys.length - 1; ++i){
			for (let k in convertKeys){
				let v = convertKeys[k]
				let nvs = R.values(v)
				convertKeys[k] = nvs.length > 0 ? nvs[0] : []
			}
		}
		let prop = this.keys[keys.length]
		return R.map(R.prop(prop), convertKeys)
	}

	delete(keys) {
		if (keys.length > this.keys.length) {
			throw new Error(`<rave:table:delete> error: Invalid input keys ${keys}`)
		}
		this.datas = R.dissocPath(keys, this.datas)
		this.isDirty = true
	}

	deleteAll() {
		this.datas = {}
		this.isDirty = true
	}

	info() {
		return {
			size: this.size,
			keys: this.keys
		}
	}

	_setDatas(datas){
		for (let d of datas){
			let dkeys = this._getKeys(d)
			this.datas = R.assocPath(dkeys, d, this.datas)
		}
	}

	_getKeys(data) {
		let keyValues = []
		for (let k of this.keys) {
			keyValues.push(`${data[k]}`)
		}
		return keyValues
	}
}

module.exports = RaveTable