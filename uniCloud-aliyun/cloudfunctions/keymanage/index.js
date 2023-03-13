'use strict';

const common = require("wx-common")
const db = uniCloud.database()

exports.main = async (event, context) => {
	// get current keyhash
	let d = (await db.collection("common").where({ _id: "data" }).get()).data
	if (d.length == 0)
		return { err: "cannot get data" }
	d = d[0]
	if (!d.keyhash)
		return { err: "cannot get keyhash" }

	// compare input key and current keyhash
	let cmp = common.cmp(event.key, d.keyhash)

	if (event.query == "check")
		return { cmp: cmp }
	else if (event.query == "change" && !cmp)
		return { err: "incorrect prevkey" }

	if (event.query != "change")
		return { err: "invalid query" }

	// get openid
	let openid
	if (event.token)
		openid = common.verifyToken(event.token)
	else
		return { err: "user not logged in" }

	// ensure the user is a teacher
	let me = (await db.collection("teachers").where({ openid: openid }).get()).data
	if (!me)
		return { err: "not a teacher" }

	// ensure there is history
	if (!d.history)
		return { err: "cannot get history" }

	// update keyhash and history
	let keyhash = common.hash(event.new)
	await db.collection("common").doc("data").update({
		keyhash: keyhash,
		history: [{
			"updater": me.name,
			"time": Date(),
			"prev": d.keyhash
		}].concat(d.history)
	})

	return {}
};
