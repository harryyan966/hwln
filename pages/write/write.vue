<template>
	<view>
		<back></back>
		<view class="title acc1">写假条 write</view>
		
		<view v-if="cnames ? cnames.length == 0 : false" class="twarn warning">*只有加入了班级才能填写假条哦<br>Please join a class to write notes</view>
		<view v-else class="container">
			<!-- the class of the students requesting the leave -->
			<SelectInput
			icon="symbols/a1-class.svg"
			placeholder="班级 class"
			color="a1"
			@change="e => { noteInfo.class = e; warnings.class = ''; noteInfo.students = [] }"
			:options="cnames"
			:warning="warnings.class"
			/>

			<!-- ask for the students requesting the leave -->
			<CheckboxInput
			@change="e => { noteInfo.students[e] = !noteInfo.students[e]; $forceUpdate(); warnings.students = '' }"
			:options="noteInfo.class != -1 ? classes[cnames[noteInfo.class]] : undefined"
			:selected="noteInfo.students"
			:warning="warnings.students"
			/>

			<!-- ask for date -->
			<SelectInput
			icon="symbols/a1-date.svg"
			placeholder="日期 date"
			color="a1"
			@change="e => { noteInfo.date = e; warnings.date = '' }"
			:options="dates"
			:warning="warnings.date"
			style="white-space: pre;"
			/>

			<!-- ask for supervisor -->
			<SelectInput
			icon="symbols/a1-teacher.svg"
			placeholder="指导老师 supervisor"
			color="a1"
			@change="e => { noteInfo.supervisor = e; warnings.supervisor = '' }"
			:options="teachers"
			:warning="warnings.supervisor"
			/>

			<!-- ask for message and reason -->
			<TextInput
			icon="symbols/a1-message.svg"
			placeholder="事由 reason"
			@change="e => { noteInfo.message = e; warnings.message = '' }"
			:warning="warnings.message"
			/>

			<view class="btn acc1" @click="submit">提交 submit</view>
		</view>
	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				cnames: undefined,
				classes: undefined,
				teachers: undefined,
				dates: undefined,
				
				noteInfo: {
					'class': '-1',
					'students': [],
					'date': '-1',
					'supervisor': '-1',
					'message': ''
				},
				
				warnings: {
					'class': '',
					'students': '',
					'date': '',
					'supervisor': '',
					'message': ''
				},
			}
		},

		onLoad() {
			uni.getStorage({
				key: "me",
				success: (res) => {
					cloudApi.call({
						name: "getClasses",
						data: {
							query: "write",
							identity: res.data.identity
						},
						success: (res) => {
							if (res.result.err) {
		                		uni.showToast({
		                			icon: "error",
		                			duration: 2000,
		                			title: res.result.err
		                		})
		                		return
		                	}
							this.classes = res.result.data.classes
							this.cnames = res.result.data.cnames
						}
					})
				}
			})
			
			cloudApi.call({
				name: "getUsers",
				data: {
					type: "teacher",
					field: "name"
				},
				success: (res) => {
					if (res.result.err) {
                		uni.showToast({
                			icon: "error",
                			duration: 2000,
                			title: res.result.err
                		})
                		return
                	}
					this.teachers = res.result.data.map( e => e + "老师" )
				}
			})

			// get available dates

			// allow the user to select within five days from now
			const DAYS = ['周日 Sun', '周一 Mon', '周二 Tue', '周三 Wed', '周四 Thu', '周五 Fri', '周六 Sat'];
			this.dates = [];
			let now = new Date();
			// check if we should include today
			if (now.getHours() < 12) {
				this.dates.push(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} (${DAYS[now.getDay()]})`);
			}
			// add a date until there are five available dates
			while (this.dates.length < 5) {
				// advance one day
				now.setTime(now.getTime() + 1000*60*60*24);
				this.dates.push(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} (${DAYS[now.getDay()]})`);
			}
		},

		methods: {
			submit() {	
				let valid = true;
				
				if (this.noteInfo.class == -1) {
					this.warnings.class = '请选择班级<br>please select a class'; valid = false;
				}
				else if (!this.noteInfo.students.some(e => e)) {
					this.warnings.students = '请选择需要请假的学生<br>please select some students'; valid = false;
				}
				if (this.noteInfo.date == -1) {
					this.warnings.date = '请选择日期<br>please select a date'; valid = false;
				}
				if (this.noteInfo.supervisor == -1) {
					this.warnings.supervisor = '请选择指导老师<br>please select a supervisor'; valid = false;
				}
				if (this.noteInfo.message.split(" ").join("").length == 0) {
					this.warnings.message = '请输入请假事由<br>please provide a reason for the leave'; valid = false;
				}
				
				// ensures the user inputs a valid date
				let now = new Date();
				let chosenDate;
				if (this.noteInfo.date != -1) {
					chosenDate = new Date(this.dates[this.noteInfo.date].split(' ')[0]);
					// if it is already afternoon but the date chosen is still today...
					if (now.getHours() > 12 && chosenDate.getDate() == now.getDate()) {
						this.warnings.date = '谈笑间已经过了十二点，刷新下页面吧<br>special issue, please refresh the page'; valid = false;
					}
				}

				if (valid) {
					// remind the user if he/she is choosing the date in weekends
					if (chosenDate.getDay() == 0 || chosenDate.getDay() == 6)	{	// Weekends
						uni.showModal({
							title: `${this.dates[this.noteInfo.date].split(' ')[0]}是周末，确认创建吗？\r\nThe date seems to be in a weekend, is this right?`,
							cancelText: '取消 no',
							confirmText: '确认 yes',
							success: (res) => {
								if (res.confirm) {
									this.complete();
								}
							}
						})
					}
					else {
						this.complete();
					}
				}
			},

			complete() {
				let cname = this.cnames[this.noteInfo.class]
				let allstudents = this.classes[cname]
				let students = [];

				// turn student indices to names
				for (let i in allstudents) {
					if (this.noteInfo.students[i]) {
						students.push(allstudents[i]);
					}
				}

				cloudApi.call({
					name: "write",
					data: {
						class: cname,
						students: students,
						date: this.dates[this.noteInfo.date].split(' ')[0],
						supervisor: this.teachers[this.noteInfo.supervisor].slice(0,-2),
						message: this.noteInfo.message,
						ssuper: false,
						sclass: false
					},
					success: (res) => {
						if (res.result.err) {
	                		uni.showToast({
	                			icon: "error",
	                			duration: 2000,
	                			title: res.result.err
	                		})
	                		return
	                	}
						uni.showModal({
							showCancel: false,
							confirmText: 'OK',
							title: "提交成功\r\nSubmitted",
							success: (res) => {
								if (res.confirm) {
									uni.navigateBack({
										delta: 1
									})
								}
							}
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "@/static/global.scss";

	.container {
		margin-top: 100rpx;
	}
	
	.warning {
		font-size: 40rpx;
	}
	
	.btn {
		margin: auto;
		margin-top: 100rpx;
		margin-bottom: 100rpx;
		width: 400rpx;
	}
</style>