"use strict"

const should = require("should")
const Define = require("../lib/define")
const shutil = require("shutil.js")

describe("rave_delete", ()=> {
	it("delete_ready", async () => {
		await shutil.copy("test/data/select", "temp/select", {override:true})
		await shutil.copy("test/data/select_union", "temp/select_union", {override:true})
	})

	it("delete_single", async () => {	
		const {Rave} =  require("../lib/rave")
		const r = new Rave()		
		await r.init({dbroot: "temp/select", syncInterval: 200})

		await r.delete("Player", ["10001"])
		let p_10001 = await r.select("Player", [10001])
		p_10001.length.should.equal(0)
		await r.close()
	})

	it("delete_multiple", async () => {	
		const {Rave} =  require("../lib/rave")
		const r = new Rave()		
		await r.init({dbroot: "temp/select_union", syncInterval: 200})

		await r.delete("Player", [10011, 2001, 1001, 1])		
		let playersById = await r.select("Player", [10011])
		playersById.length.should.equal(4)
		
		await r.close()
	})

	it("delete_all", async () => {	
		const {Rave} =  require("../lib/rave")
		const r = new Rave()		
		await r.init({dbroot: "temp/select", syncInterval: 200})

		await r.deleteAll("Player")
		let keys = await r.selectAllKeys("Player")
		keys.length.should.equal(0)

		await r.close()
	})

	it("clean", async () => {
		shutil.rd("temp")
	})
})