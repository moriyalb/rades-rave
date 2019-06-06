"use strict"

const should = require("should")
const Define = require("../lib/define")
const shutil = require("shutil.js")

describe("rave_select", ()=> {
	it("select_ready", async () => {
		await shutil.copy("test/data/select", "temp/select", {override:true})
		await shutil.copy("test/data/select_union", "temp/select_union", {override:true})
	})

	it("select_single", async () => {	
		const {Rave} =  require("../lib/rave")
		const r = new Rave()		
		await r.init({dbroot: "temp/select", syncInterval: 200})

		let p_10001 = await r.select("Player", [10001])
		
		p_10001.length.should.equal(1)

		let [p] = p_10001
		p.playerID.should.equal(10001)			
		await r.close()
	})

	it("select_multiple", async () => {	
		const {Rave} =  require("../lib/rave")
		const r = new Rave()		
		await r.init({dbroot: "temp/select_union", syncInterval: 200})

		let playersById = await r.select("Player", [10011])		
		playersById.length.should.equal(5)

		playersById = await r.select("Player", [10011, 2001])		
		playersById.length.should.equal(3)

		playersById = await r.select("Player", [10011, 2001, 1001])		
		playersById.length.should.equal(2)

		playersById = await r.select("Player", [10011, 2001, 1001, 1])		
		playersById.length.should.equal(1)

		playersById = await r.select("Player", [10011, 2001, 1001, 100])		
		playersById.length.should.equal(0)

		await r.select("Player", [10011, 2001, 1001, 1, 0]).should.rejected()		
				
		await r.close()
	})

	it("clean", async () => {
		shutil.rd("temp")
	})
})