const appid = "wx9c5df84eba07ad76";
const appsecret = "de455a3d59e3baff8cac2fc458c8a5ff";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

const DAYS_BEFORE_EXPIRATION = 1;
const SALT_LEVEL = 5;

function getToken(openid) {
	return jwt.sign({openid: openid}, appsecret, {expiresIn: 60*60*24*DAYS_BEFORE_EXPIRATION});
}

function verifyToken(token) {
	return jwt.verify(token, appsecret).openid;
}

function hash(key) {
	const salt = bcrypt.genSaltSync(SALT_LEVEL)
	const hash = bcrypt.hashSync(key, salt)
	return hash
}

function cmp(key, hash) {
	return bcrypt.compareSync(key, hash)
}

module.exports = {
	appid: appid,
	appsecret: appsecret,
	getToken: getToken,
	verifyToken: verifyToken,
	hash: hash,
	cmp: cmp
}
