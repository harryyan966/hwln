'use strict';

const common = require("wx-common");
const db = uniCloud.database();

exports.main = async (event, context) => {
	let openid;
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
	}

	// get user data
	let identity = undefined;

	let me = (await db.collection("students").where({ openid: openid }).get()).data;
	console.log(me)

	if (me.length > 0) {
		me = me[0];
		identity = "student"
	}
	else {
		me = (await db.collection("teachers").where({ openid: openid }).get()).data;

		if (me.length > 0) {
			me = me[0];
			identity = "teacher"
		}
		else me = undefined
	}

	if (me) {
		// prevent openid from being visible in the front-end
		delete me.openid
		me.identity = identity
	}

	// return the jwt, or encrypted openid available for a certain period of time
	const token = common.getToken(openid);

	return {
		me: me,
		token: token
	}
};