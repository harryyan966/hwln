'use strict';

const common = require("wx-common");
const db = uniCloud.database();

exports.main = async (event, context) => {
	// get openid by calling the wechat server
	const res = await uniCloud.httpclient.request(
		"https://api.weixin.qq.com/sns/jscode2session"
		+ "?appid=" + common.appid
		+ "&secret=" + common.appsecret
		+ "&js_code="	+ event.code
		+ "&grant_type=authorization_code",
		{ dataType: "json" }
	);
	let openid = res.data.openid;
	let token = common.getToken(openid)
	let identity = event.identity == 0 ? "teacher" : "student"
	let me = event

	delete me.identity
	delete me.code
	delete me.token

	if (identity == "student")
		me.crel = false
	me.openid = openid

	await db.collection(identity + "s").add(me)

	delete me.openid
	me.identity = identity

	return {
		me: me,
		token: token
	}
};