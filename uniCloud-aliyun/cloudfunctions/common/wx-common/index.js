const appid = "wx9c5df84eba07ad76";
const appsecret = "1941dbdb4cb5014c3f72f7c1cadeb852";

const jwt = require('jsonwebtoken');

const DAYS_BEFORE_EXPIRATION = 1;

function getToken(openid) {
	return jwt.sign({openid: openid}, appsecret, {expiresIn: 60*60*24*DAYS_BEFORE_EXPIRATION});
}

function verifyToken(token) {
	return jwt.verify(token, appsecret).openid;
}

module.exports = {
	appid: appid,
	appsecret: appsecret,
	getToken: getToken,
	verifyToken: verifyToken
}
