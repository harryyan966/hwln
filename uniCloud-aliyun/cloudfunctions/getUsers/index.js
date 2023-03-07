'use strict';

const db = uniCloud.database()

exports.main = async (event, context) => {
	if (event.type != "student" && event.type != "teacher")
		return { err: "cannot get specified user list" }

	let data = (await db.collection(event.type + "s").get()).data
	
	if (!data)
		return { err: "cannot get specified user list" }

	else {
		if (data.length != 0) {
			if (event.field == "all") {
				for (let d of data) {
					delete d.openid
				}
			}
			else if (data[0][event.field]) {
				data = data.map(e => e[event.field])
			}
			else {
				return { err: "specified field does not exist" }
			}
		}
	}

	return {
		data: data
	}
};
