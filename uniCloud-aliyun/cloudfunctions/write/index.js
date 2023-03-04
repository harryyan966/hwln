'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	const students = (await db.collection("students").get()).data;

	// add associated dorms to note
	const dorms = [];
	for (let ns of event.students) {
		for (let s of students) {
			if (ns == s.name) {
				if (!dorms.includes(s.dorm)) {
					dorms.push(s.dorm);
				}

				break;
			}
		}
	}
	event.dorms = dorms.join("，");
	delete event.token

	await db.collection("xNotes").add(event)
	
	return {
	}
};