'use strict';

const common = require("wx-common");
const db = uniCloud.database();

exports.main = async (event, context) => {
	// get openid
	let openid
	if (event.token) openid = common.verifyToken(event.token)
	else return { err: "user not logged in" }
	event.openid = openid
	let token = event.token
	delete event.token
	let identity = event.identity
	delete event.identity
	event.class = ""

	if (identity == 0) {
		delete event.dorm
		await db.collection("teachers").add(event)
	}
	else if (identity == 1) {
		await db.collection("students").add(event)
	}

	return {
		token: token
	}
};