# rades-rave
A lightweight, non-schema, local database simulator

[![Build Status](https://travis-ci.org/moriyalb/shutil.js.svg?branch=master)](https://travis-ci.org/moriyalb/shutil.js)
[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

# Installation

Using npm:
```shell
$ npm i -g rades-rave
```

# Usage

```js
//default instance
let rave = require('rades-rave').default
//or you can create a new instance
//const {Rave} = require('rades-rave')
//let rave = new Rave()

async () => {
	await rave.init({
		maxStorage: 1024 * 1000,
		syncInterval: 5 * 1000,
		dbroot: "/data/ravedb"
	})

	//single primary key
	await rave.insert("RaveTestDB", ["dbid"], [{
		"dbid" : 1,
		"data" : "anything"
	}])
	let datas = await rave.select("RaveTestDB", [1])

	//union primary key
	await rave.insert("RaveTestPlayerDB", ["playerId", "itemId"], [{
		"playerId" : 1,
		"itemId" : 1001,
		"data" : "anything"
	},{
		"playerId" : 1,
		"itemId" : 1002,
		"data" : "anything"
	}
	])
	datas = await rave.select("RaveTestPlayerDB", [1]) //=> Got two records
	datas = await rave.select("RaveTestPlayerDB", [1, 1002]) //=> Got one records
	await rave.delete("RaveTestPlayerDB", [1, 1002]) //Delete one.

	await rave.close()
}
```

# Description

* `rades-rave` is just use for quickly server development. Sometimes you don't really want to concern about the database detail.
* `rades-rave` is worked well with `rades` solution. [Learn More](https://github.com/moriyalb/rades)
* `rades-rave` don't support really `sql` features, it's just a very very lightweight, simply simulation.