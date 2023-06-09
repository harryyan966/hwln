'use strict';

const common = require("wx-common")
const db = uniCloud.database()

exports.main = async (event, context) => {
	let raw = (await db.collection("xClasses").get()).data
	let data

	if (!raw)
		return { err: "cannot get classes" }
	
	if (event.query == "write") {

		if (event.identity != "teacher" && event.identity != "student")
			return { err: "invalid identity" }

		let classes = {}
		let cnames = []
		if (raw.length != 0) {
			if (event.identity == "teacher") {
				for (let c of raw) {
					classes[c.name] = c.students
					cnames[cnames.length] = c.name
				}
			}
			else if (event.identity == "student") {
				let openid
				if (event.token) openid = common.verifyToken(event.token)
				else return { err: "user not logged in" }

				let me = (await db.collection("students").where({ openid: openid }).get()).data
				if (me.length == 0)
					return { err: "user does not exist" }
				else
					me = me[0]

				raw = raw.find(e => e.students.includes(me.name))
				console.log(raw)
				if (raw) {
					classes[raw.name] = raw.students
					cnames[0] = raw.name
				}
			}
		}
		data = {
			classes: classes,
			cnames: cnames
		}
	}
	else if (event.query == "cview") {
		/*
		let openid
		if (event.token) openid = common.verifyToken(event.token)
		else return { err: "user not logged in" }

		console.log("identity:")
		console.log(event.identity)
		let me = (await db.collection(event.identity + "s").where({
			openid: openid
		}).get()).data
		*/

		// TODO: filtering logic: who sees what
		data = {
			cnames: raw.map(e => e.name)
		}
	}
	else if (event.query == "cdetail") {
		let openid
		if (event.token) openid = common.verifyToken(event.token)
		else return { err: "user not logged in" }

		console.log("identity:")
		console.log(event.identity)
		let me = (await db.collection(event.identity + "s").where({
			openid: openid
		}).get()).data
		if (me.length == 0)
			return { err: "user does not exist" }
		else
			me = me[0]
		console.log(me)

		let cnow = raw.find(e => e.name == event.cname)
		let isRelated = true
		console.log(cnow)

		if (event.identity == "student" && !cnow.students.includes(me.name) && !cnow.pending.includes(me.name)) {
			isRelated = false
		}
		if (event.identity == "teacher" && cnow.teacher != me.name) {
			isRelated = false
		}

		data = {
			isRelated: isRelated,
			cdetail: cnow
		}
	}

	return {
		data: data
	}
};
