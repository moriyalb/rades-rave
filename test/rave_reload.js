"use strict"

const should = require("should")
const Define = require("../lib/define")
const shutil = require("shutil.js")
const R = require("ramda")

describe("rave_reload", ()=> {
	it("empty", async () => {
		const {Rave} =  require("../lib/rave")
		const r = new Rave()
		r.state.should.equal(Define.DB_STATUS.INVALID)
		
		await r.init({dbroot: "temp/reload/nothing_really_here"})
		r.state.should.equal(Define.DB_STATUS.READY)
		r.tables.size.should.equal(0)

		await r.close()		
	})

	it("reload_test", async () => {
		//init reload data.
		await shutil.copy("test/data/reload", "temp/reload", {override:true})

		const {Rave} =  require("../lib/rave")
		const r = new Rave()		
		await r.init({dbroot: "temp/reload", syncInterval: 200})
		r.tables.size.should.equal(1)
		let table = r.tables.get("Player")

		R.keys(table.datas).length.should.equal(1)
		let datas = table.datas["10001"]
		
		datas.PlayerID.should.equal(10001)
		datas.nick.should.equal("中文昵称")
		datas.level.should.equal(100)
		datas.cards.should.deepEqual([1,2,3,4,5])		
		await r.close()
	})

	it("clean", async () => {
		shutil.rd("temp")
	})
})