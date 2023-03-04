'use strict';

const db = uniCloud.database()

exports.main = async (event, context) => {
	let data

	if (event.type == "student") {
		data = (await db.collection("students").get()).data
	}
	else if (event.type == "teacher") {
		data = (await db.collection("teachers").get()).data
	}

	if (!data) {
		data = {
			err: "cannot get specified user list"
		}
	}
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
				data = {
					err: "specified field does not exist"
				}
			}
		}
	}

	return {
		data: data
	}
};
