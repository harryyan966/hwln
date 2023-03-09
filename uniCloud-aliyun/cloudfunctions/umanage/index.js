'use strict';

const common = require("wx-common")
const db = uniCloud.database()

exports.main = async (event, context) => {
	// get user
	let openid
	if (event.token)
		openid = common.verifyToken(event.token)
	else
		return { err: "user not logged in" }

	if (event.identity != "student" && event.identity != "teacher")
		return { err: "invalid identity" }
	
	let me = (await db.collection(event.identity + "s").where({ openid: openid }).get()).data

	if (me.length == 0)
		return { err: "user does not exist" }
	else
		me = me[0]

	if (event.query == "join") {
		// you must be a student to join a class
		if (event.identity == "teacher")
			return { err: "invalid request" }

		// you must not have a class to join a class
		if (me.crel)
			return { err: "cannot join more than one classes" }

		// you must be out of the class to join the class
		let myclass = (await db.collection("xClasses").where({ name: event.cname }).get()).data[0]
		if (myclass && myclass.students.includes(me.name))
			return { err: "joined already" }

		// ensure the user doesn't join other classes
		await db.collection("students").doc(me._id).update({ crel: true })

		// join the class
		await db.collection("xClasses").doc(myclass._id).update({
			pending: myclass.pending.concat([me.name])
		})
	}
	else if (event.query == "quit") {
		// you must be a student to join a class
		if (event.identity == "teacher")
			return { err: "invalid request" }

		let classes = (await db.collection("xClasses").get()).data
		let myclass = classes.find( e => e.students.includes(me.name) )

		// if i am in the class, quit the class
		if (myclass)
			await db.collection("xClasses").doc(myclass._id).update({
				students: myclass.students.filter( e => e != me.name )
			})

		// if i am pending, end the join request
		else if (myclass = classes.find( e => e.pending.includes(me.name) )) {
			if (!myclass)
				return { err: "user not in a class" }
			await db.collection("xClasses").doc(myclass._id).update({
				pending: myclass.pending.filter( e => e != me.name )
			})
			console.log("remove from pending success")
		}

		// allow the user to join other classes
		await db.collection("students").doc(me._id).update({ crel: false })
	}
	else if (event.query == "delete") {
		let classes = (await db.collection("xClasses").get()).data
		await db.collection(event.identity + "s").doc(me._id).remove()

		if (event.identity == "teacher") {
			// delete all my classes
			for (let c of classes) {
				if (c.teacher == me.name)
					await db.collection("xClasses").doc(c._id).remove()
			}
		}
		else if (event.identity == "student") {
			// quit my class
			let myclass = classes.find( e => e.students.includes(me.name) )
			if (myclass)
				await db.collection("xClasses").doc(myclass._id).update({
					students: myclass.students.filter( e => e != me.name )
				})
			myclass = classes.find( e => e.pending.includes(me.name) )
			if (myclass)
				await db.collection("xClasses").doc(myclass._id).update({
					pending: myclass.pending.filter( e => e != me.name )
				})
		}
	}
	else if (event.query == "newdorm") {
		if (event.identity == "teacher")
			return { err: "invalid request" }

		await db.collection("students").doc(me._id).update({ dorm: event.newdorm })
	}
	
	return {}
};
