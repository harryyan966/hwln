'use strict';

const common = require("wx-common")
const db = uniCloud.database()

exports.main = async (event, context) => {
	let openid
	if (event.token) openid = common.verifyToken(event.token)
	else return { err: "user not logged in" }

	let notes = (await db.collection("xNotes").get()).data
	let note = notes.find( e => e._id == event.id )

	if (!note)
		return { err: "nonexistent note" }

	if (event.query == "sign") {
		let teachers = (await db.collection("teachers").get()).data
		let me = teachers.find( e => e.openid == openid )
		console.log(teachers)
		console.log(me)

		if (!me)
			return { err: "not authorized" }

		if (event.type == "super" && me.name == note.supervisor) {
			await db.collection("xNotes").doc(note._id).update({
				ssuper: !note.ssuper
			})
			return {}
		}
		if (event.type == "class" && me.name == note.homeroom) {
			await db.collection("xNotes").doc(note._id).update({
				sclass: !note.sclass
			})
			return {}
		}

		return { err: "not authorized" }
	}
	else if (event.query == "del") {
		await db.collection("xNotes").doc(note._id).remove()
		return {}
	}
	return {}	
};
