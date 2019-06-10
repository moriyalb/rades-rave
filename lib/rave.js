"use strict"

const fsp = require("fs").promises
const shutil = require("shutil.js")
const R = require("ramda")
const _ = require('lodash')

const Util = require("./util")
const Option = require("./option")
const Define = require("./define")
const RaveTable = require("./table")

/**
 * A lightweight, non-schema, local database simulator
 * 
 * @description 
 * 		Cache all datas in memory and save files simply by whole.
 * 		If you want a more efficient version, try `rades-rave-pro`.
 * 		This database simulator should just be used in develop enviorment.
 * 
 */
class Rave {
	constructor() {
		this.state = Define.DB_STATUS.INVALID
		this.tables = new Map()
	}

	async init(opts = {}) {
		this.options = R.merge(Option, opts)
		
		if (!this.options.dbroot) {
			throw new Error(`<rave:init> failed: Rave need a directory to init database files.`)
		}

		await shutil.mkdirp(this.options.dbroot)

		this.state = Define.DB_STATUS.INITIALIZING
		await this.reload()

		this.storeTimer = setInterval(this._schedule.bind(this), this.options.syncInterval)				
	}

	async close() {
		if (this.state == Define.DB_STATUS.INVALID) return
		
		clearInterval(this.storeTimer)

		await this._schedule()

		this.state = Define.DB_STATUS.INVALID
		this.options = null
		this.tables = new Map()
	}

	async reload() {
		if (!await shutil.exists(this._ravePath())){
			this.state = Define.DB_STATUS.READY
			return
		}

		let f = await fsp.readFile(this._ravePath())
		let tblInfo = JSON.parse(f)
		for (let tbl in tblInfo){	
			let djson = await fsp.readFile(this._tblPath(tbl))
			let table = new RaveTable(tbl)			
			table.reload(tblInfo[tbl], djson.toString())
			this.tables.set(tbl, table)			
		}

		this.state = Define.DB_STATUS.READY
	}

	async insert(tbl, keys, datas, opts = {}) {
		if (this.state == Define.DB_STATUS.INVALID){
			throw new Error(`<rave:insert> failed: database is not ready `)
		}		
		if (!Util.checkTable(tbl)){
			throw new Error(`<rave:insert> failed: invalid table ${tbl} `)
		}
		if (!Util.checkKey(keys)){
			throw new Error(`<rave:insert> failed: invalid key ${keys} `)
		}
		if (!Util.checkDatas(datas)){
			throw new Error(`<rave:insert> failed: invalid datas ${datas} `)
		}

		let table = this.tables.get(tbl)
		if (!table){
			table = new RaveTable(tbl)
			if (!!keys){
				table.keys = keys
			}			
			this.tables.set(tbl, table)
		}else{
			if (!!keys && !_.isEqual(table.keys, keys)){
				let err = `<rave:insert> error: insert keys ${keys} is not match to the old keys ${table.keys}`
				if (!!opts.force){
					console.error(err)
					table.reInit(keys)
				}else{
					throw new Error(err)
				}
			}
		}
		
		table.insert(datas)		
	}

	async select(tbl, keys) {
		if (this.state == Define.DB_STATUS.INVALID){
			throw new Error(`<rave:select> failed: database is not ready `)
		}		
		if (!Util.checkTable(tbl)){
			throw new Error(`<rave:select> failed: invalid table ${tbl} `)
		}
		if (!Util.checkKeyValue(keys)){
			throw new Error(`<rave:select> failed: invalid key ${keys} `)
		}

		let table = this.tables.get(tbl)
		if (!table) {
			throw new Error(`<rave:select> error: Invalid table ${tbl}`)
		}
		return table.select(keys)
	}

	async selectAllKeys(tbl, keys = []) {
		if (this.state == Define.DB_STATUS.INVALID){
			throw new Error(`<rave:selectAllKeys> failed: database is not ready `)
		}		
		if (!Util.checkTable(tbl)){
			throw new Error(`<rave:selectAllKeys> failed: invalid table ${tbl} `)
		}
		if (!Util.checkKeyValue(keys)){
			throw new Error(`<rave:selectAllKeys> failed: invalid key ${keys} `)
		}
		let table = this.tables.get(tbl)
		if (!table) {
			throw new Error(`<rave:selectAllKeys> error: Invalid table ${tbl}`)
		}
		return table.selectAllKeys(keys)
	}

	async delete(tbl, keys) {
		if (this.state == Define.DB_STATUS.INVALID){
			throw new Error(`<rave:delete> failed: database is not ready `)
		}		
		if (!Util.checkTable(tbl)){
			throw new Error(`<rave:delete> failed: invalid table ${tbl} `)
		}
		if (!Util.checkKeyValue(keys)){
			throw new Error(`<rave:delete> failed: invalid key ${keys} `)
		}
		
		let table = this.tables.get(tbl)
		if (!table) {
			throw new Error(`<rave:delete> error: Invalid table ${tbl}`)
		}
		table.delete(keys)
	}
	
	async deleteAll(tbl) {
		if (this.state == Define.DB_STATUS.INVALID){
			throw new Error(`<rave:deleteAll> failed: database is not ready `)
		}		
		if (!Util.checkTable(tbl)){
			throw new Error(`<rave:deleteAll> failed: invalid table ${tbl} `)
		}
		
		let table = this.tables.get(tbl)
		if (!table) {
			throw new Error(`<rave:deleteAll> error: Invalid table ${tbl}`)
		}
		table.deleteAll()
	}

	async _schedule() {
		if (this.state != Define.DB_STATUS.READY){
			console.warn("<rave:store> warn: current store action is taken much time. try raise the `Option.syncInterval` value.")				
			return
		}

		let totalSize = 0
		let modified = false
		for (let [tbl, table] of this.tables){
			if (!table.isDirty) continue
			await this._saveTable(table)
			totalSize += table.size
			modified = true
		}	

		if (modified){
			this._saveRave()
			if (totalSize > this.options.maxStorage){
				console.warn(`<rave:store> warn: current storage is full( ${totalSize} > ${this.options.maxStorage}). 
If you really want save those datas, try raise the \`option.maxStorage\` value.
Or you should switch to a really database system(mysql, postgre, etc)`)				
			}
		}	
	}

	async _saveRave() {
		let tblInfo = {}
		for (let [tbl, table] of this.tables){
			tblInfo[tbl] = table.info()
		}
		await fsp.writeFile(this._ravePath(), JSON.stringify(tblInfo))
	}

	async _saveTable(table) {		
		let toSave = table.serialize()
		await fsp.writeFile(this._tblPath(table.tblName), toSave)
		table.isDirty = false
	}

	_ravePath() {
		return `${this.options.dbroot}/.rave`
	}

	_tblPath(tbl) {
		return `${this.options.dbroot}/${tbl}.json`
	}
}

module.exports = {
	Rave,
	default: new Rave()
}