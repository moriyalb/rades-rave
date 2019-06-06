"use strict"

describe("rave_basic", ()=> {
	it("default", async () => {
		const {Rave, default:r} =  require("../lib/rave")
		r.should.instanceOf(Rave)
		r.close()
	})
})