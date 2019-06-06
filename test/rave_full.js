"use strict"

const should = require("should")
const Define = require("../lib/define")
const shutil = require("shutil.js")

describe("rave_full", ()=> {
	it("full_ready", async () => {
		await shutil.rd("temp/full")
	})

	it("full_warn", async () => {
		const {Rave} =  require("../lib/rave")
		const r = new Rave()
		await r.init({dbroot: "temp/full", maxStorage: 5})
		await r.insert("Player", ["playerID"], [{
			playerID: 10001,
			level: 101,
			name: "知易行难",
			cards:[
				{cardLevel:1, cardExp:100},
				{cardLevel:2, cardExp:110}
			]
		}])
		await r.close()
	})

	it("clean", async () => {
		shutil.rd("temp")
	})
})