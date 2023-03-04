'use strict';

const common = require("wx-common")
const db = uniCloud.database()

exports.main = async (event, context) => {
	let notes = (await db.collection("xNotes").get()).data

	// set notes' oldest limit
	const days_to_keep = 1;
	let old = new Date();
	old.setTime(old.getTime() - 1000*60*60*24 * 1);

	// remove old notes
	for (let note of notes) {
		// too old
		if (new Date(note.date) <= old) await db.collection("xNotes").doc(note._id).remove();
	}

	notes = notes.filter( note => (new Date(note.date) > old) )

	// get homeroom teacher name
	let classes = (await db.collection("xClasses").get()).data

	for (let note of notes) {
		if (!note.homeroom) {
			note.homeroom = classes.find( e => e.name == note.class ).teacher
			await db.collection("xNotes").doc(note._id).update({
				homeroom: note.homeroom
			})
		}
	}

	// get user
	let openid
	if (event.token) openid = common.verifyToken(event.token)
	else return { err: "user not logged in" }

	let me
	if (event.identity == "teacher") {
		let teachers = (await db.collection("teachers").get()).data
		let me = teachers.find( e => e.openid == openid )
		if (!me) return { err: "user does not exist" }
		notes = notes.filter( note => note.students = note.students.join("，") )
	}
	else if (event.identity == "student") {
		let students = (await db.collection("students").get()).data
		let me = students.find( e => e.openid == openid )
		if (!me) return { err: "user does not exist" }
		notes = notes.filter( note => note.students.includes(me.name) )
		notes = notes.filter( note => note.students = note.students.join("，") )
	}

	// sort notes from oldest to newest
	notes.sort((a,b) => {
		return new Date(a.date) - new Date(b.date)
	});

	console.log(notes)
	
	return {
		notes: notes
	}
};
