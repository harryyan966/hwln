'use strict';

const db = uniCloud.database()

exports.main = async (event, context) => {
	let dorms = (await db.collection("xDorms").get()).data

	console.log(dorms)

	let rooms = {}
	let halls = []
	for (let d of dorms) {
		rooms[d.hall] = d.rooms
		halls[halls.length] = d.hall
	}

	return {
		data: {
			rooms: rooms,
			halls: halls
		}
	}
};
