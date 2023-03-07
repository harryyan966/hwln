'use strict';

const common = require("wx-common");
const db = uniCloud.database();

exports.main = async (event, context) => {
	// get openid
	let openid;
	let token;
	// by decrypting jwt stored in the front-end
	if (event.token)
		openid = common.verifyToken(event.token);
	// or by calling the wechat server
	else {
		const res = await uniCloud.httpclient.request(
			"https://api.weixin.qq.com/sns/jscode2session"
			+ "?appid=" + common.appid
			+ "&secret=" + common.appsecret
			+ "&js_code="	+ event.code
			+ "&grant_type=authorization_code",
			{	dataType: "json" }
		);
		openid = res.data.openid;
		token = common.getToken(openid)
	}

	event.openid = openid
	let identity = event.identity
	delete event.identity
	// TODO: store class with users
	// event.class = ""
	if (event.token)
		delete event.token
	if (event.code)
		delete event.code

	console.log(event)
	if (identity == 0) {
		console.log("adding teacher")
		delete event.dorm
		await db.collection("teachers").add(event)
	}
	else if (identity == 1) {
		console.log("adding student")
		await db.collection("students").add(event)
	}

	delete event.openid

	return {
		userInfo: event,
		token: token
	}
};