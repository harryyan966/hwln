'use strict';

const common = require("wx-common")
const db = uniCloud.database()

exports.main = async (event, context) => {
	// get user
	let openid
	if (event.token) openid = common.verifyToken(event.token)
	else return { err: "user not logged in" }
	let me = (await db.collection("teachers").where({ openid: openid }).get()).data
	if (me.length == 0)
		return { err: "user not logged in" }
	else
		me = me[0]

	if (event.query == "create") {
		// check duplicate class name
		let classes = (await db.collection("xClasses").where({ name: event.cname }).get()).data
		console.log(classes)
		if (classes.length > 0)
			return { err: "duplicate class name" }

		// add class
		await db.collection("xClasses").add({
			name: event.cname,
			teacher: me.name,
			students: [],
			pending: []
		})
	}
	else if (event.query == "delete") {
		// check class ownership
		let classes = (await db.collection("xClasses").get()).data
		let myclass = classes.find( e => e.name == event.cname )
		if (!myclass) 
			return { err: "class does not exist" }
		if (myclass.teacher != me.name)
			return { err: "not authorized" }

		// remove class
		await db.collection("xClasses").doc(myclass._id).remove()

		// free all students
		let students = (await db.collection("students").get()).data
		students = students.filter( e => myclass.students.includes(e.name) || myclass.pending.includes(e.name) )
		for (let s of students)
			await db.collection("students").doc(s._id).update({ crel: false })
	}
	else if (event.query == "transfer") {
		// check class ownership
		let classes = (await db.collection("xClasses").get()).data
		let myclass = classes.find( e => e.name == event.cname )
		if (!myclass) 
			return { err: "class does not exist" }
		if (myclass.teacher != me.name)
			return { err: "not authorized" }
		if (event.to == me.name)
			return { err: "cannot transfer to oneself" }

		// transfer class
		await db.collection("xClasses").doc(myclass._id).update({
			teacher: event.to
		})
	}
	else if (event.query == "accept" || event.query == "deny" || event.query == "remove") {
		console.log(event.query)
		// check class ownership
		let classes = (await db.collection("xClasses").get()).data
		let myclass = classes.find( e => e.name == event.cname )
		if (!myclass) 
			return { err: "class does not exist" }
		if (myclass.teacher != me.name)
			return { err: "not authorized" }

		// accept or deny
		if (event.query == "accept") {
			if (!myclass.pending.includes(event.who))
				return { err: "the student haven't requested for the join" }

			// let student in the class
			await db.collection("xClasses").doc(myclass._id).update({
					students: [event.who].concat(myclass.students),
					pending: myclass.pending.filter( e => e != event.who )
				})
		}
		else if (event.query == "deny") {
			if (!myclass.pending.includes(event.who))
				return { err: "the student haven't requested for the join" }

			// remove student from pending
			await db.collection("xClasses").doc(myclass._id).update({
				pending: myclass.pending.filter( e => e != event.who )
			})

			// free the student
			let s = (await db.collection("students").where({ name: event.who }).get()).data
			if (s.length == 0)
				return { err: "specified student does not exist" }
			s = s[0]
			await db.collection("students").doc(s._id).update({ crel: false })
		}
		else if (event.query == "remove") {			
			if (!myclass.students.includes(event.who))
				return { err: "the student is not in the class" }

			// remove student from class
			await db.collection("xClasses").doc(myclass._id).update({
				students: myclass.students.filter( e => e != event.who )
			})

			// free the student
			let s = (await db.collection("students").where({ name: event.who }).get()).data
			if (s.length == 0)
				return { err: "specified student does not exist" }
			s = s[0]
			await db.collection("students").doc(s._id).update({ crel: false })
		}
	}

	return {}
};
