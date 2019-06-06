"use strict"

const should = require("should")
const Define = require("../lib/define")
const shutil = require("shutil.js")

describe("rave_save", ()=> {
	it("save_ready", async () => {
		await shutil.rd("temp/save")
	})

	it("save_single", async () => {
		const {Rave} =  require("../lib/rave")
		const r = new Rave()
		await r.init({dbroot: "temp/save"})
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

	it("save_mutiple", async () => {
		const {Rave} =  require("../lib/rave")
		const r = new Rave()
		await r.init({dbroot: "temp/save"})
		await r.insert("Player", ["playerID"], [
		{
			playerID: 10011,
			level: 80,
			name: "知易行难1",
			cards:[
				{cardLevel:1, cardExp:100},
				{cardLevel:2, cardExp:110}
			]
		},
		{
			playerID: 10021,
			level: 90,
			name: "知易行难2",
			cards:[
				{cardLevel:1, cardExp:100},
				{cardLevel:2, cardExp:110}
			]
		}
	
		])
		await r.close()
	})

	it("save_override", async () => {
		const {Rave} =  require("../lib/rave")
		const r = new Rave()
		await r.init({dbroot: "temp/save"})
		await r.insert("Player", ["playerID"], [
		{
			playerID: 10011,
			level: 90,
			name: "知易行难_modify",
			cards:[
				{cardLevel:3, cardExp:210}
			] 
			//Array type will be overrided, not append, because we lost the key info.
			//If you want merge that correctly, make a new sub table, and add key to it.
		},
		{
			playerID: 10031,
			level: 90,
			name: "知易行难5",
			cards:[
				{cardLevel:1, cardExp:100},
				{cardLevel:2, cardExp:110}
			]
		}
	
		])
		await r.close()
	})

	it("save_union_key", async () => {
		const {Rave} =  require("../lib/rave")
		const r = new Rave()
		await r.init({dbroot: "temp/save_union"})
		await r.insert("Player", ["playerID", "cardId", "itemId", "slotId"], [
		{
			playerID: 10011,
			cardId: 2001,
			itemId: 1001,
			slotId: 1
		},
		{
			playerID: 10011,
			cardId: 2001,
			itemId: 1001,
			slotId: 2
		},

		{
			playerID: 10011,
			cardId: 2002,
			itemId: 1001,
			slotId: 1
		},
		{
			playerID: 10011,
			cardId: 2002,
			itemId: 1002,
			slotId: 1
		},

		{
			playerID: 10012,
			cardId: 2001,
			itemId: 1001,
			slotId: 1
		},
		{
			playerID: 10011,
			cardId: 2001,
			itemId: 1002,
			slotId: 2
		},
	
		])
		await r.close()
	})

	it("clean", async () => {
		shutil.rd("temp")
	})
})