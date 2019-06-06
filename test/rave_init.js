"use strict"

const should = require("should")

describe("rave_init", ()=> {
	it("init", async () => {
		const r =  require("../lib/rave").default		
		await r.init({dbroot: "C:/Temp"})
		await r.close()
	})

	it("init_fail", async () => {
		const r =  require("../lib/rave").default	
		r.init().should.rejected()
	})	
})