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
			await db.collection("xClasses").doc(myclass._id).update({
					students: myclass.students.concat([event.who]),
					pending: myclass.pending.filter( e => e != event.who )
				})
		}
		else if (event.query == "deny") {
			if (!myclass.pending.includes(event.who))
				return { err: "the student haven't requested for the join" }
			await db.collection("xClasses").doc(myclass._id).update({
				pending: myclass.pending.filter( e => e != event.who )
			})
		}
		else if (event.query == "remove") {
			if (!myclass.students.includes(event.who))
				return { err: "the student is not in the class" }
			await db.collection("xClasses").doc(myclass._id).update({
				students: myclass.students.filter( e => e != event.who )
			})
		}
	}

	return {}
};
