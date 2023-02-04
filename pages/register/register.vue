<template>
	<view>
		<back></back>
		<view class="title primary">注册</view>

		<!-- ask for real name -->
		<TextInput
		icon="user-p.svg"
		placeholder="真实姓名(让大家认识你)"
		@change="e => { usrInfo.name = e; warnings.name = '' }"
		:warning="warnings.name"
		/>

		<!-- ask for identity -->
		<SelectInput
		icon="identity-p.svg"
		placeholder="您的身份？"
		@change="e => { usrInfo.identity = e; warnings.identity= '' }"
		:options="['教师', '学生']"
		:warning="warnings.identity"
		/>

		<!-- require teacher key to register as a teacher -->
		<TextInput
		v-show="usrInfo.identity == 0"
		icon="teacher-key-p.svg"
		placeholder="「 teacher key 」"
		@change="e => { teacherKey = e; warnings.teacherKey = '' }"
		:warning="warnings.teacherKey"
		/>

		<!-- ask for dorm hall from students -->
		<SelectInput
		v-show="usrInfo.identity == 1"
		icon="dorm-p.svg"
		placeholder="您的宿舍楼？"
		@change="e => { usrInfo.hall = e; usrInfo.room = '-1'; warnings.hall = '' }"
		:options="halls"
		:warning="warnings.hall"
		/>

		<!-- ask for dorm room from students -->
		<SelectInput
		v-show="usrInfo.identity == 1 && usrInfo.hall != -1"
		placeholder="您的房间？"
		icon="room-p.svg"
		@change="e => { usrInfo.room = e; warnings.room = '' }"
		:options="rooms[halls[usrInfo.hall]]"
		:warning="warnings.room"
		/>

		<!-- submit button -->
		<view class="btn" @click="register">注册</view>

	</view>
</template>

<script>
	import cloudApi from '../../common/cloudApi.js'

	export default {
		data() {
			return {
				halls: undefined,
				rooms: undefined,
				
				// default values
				usrInfo: {
					'name': '',
					'identity': '-1',
					'hall': '-1',
					'room': '-1'
				},
				warnings: {
					'name': '',
					'identity': '',
					'teacherKey': '',
					'hall': '',
					'room': ''
				},
				teacherKey: ''	
			}
		},
		onLoad() {
			cloudApi.call({
				name: "getDorms",
				success: (res) => {
					this.halls = res.result.data.halls
					this.rooms = res.result.data.rooms
					console.log(this.halls)
					console.log(this.rooms)
				}
			})
		},
		methods: {
			async validTeacherKey() {
				// TODO: get teacherkey from server and compare hash
				return this.teacherKey == "";
			},

			async existsDuplicates() {
				let duplicate = false;
				await cloudApi.call({
					name: "getUsers",
					data: {
						type: this.usrInfo.identity == 0 ? "teacher" : "student",
						field: "name"
					},
					success: (res) => {
						console.log(res.result)
						duplicate = res.result.data.find(e => e.name == this.usrInfo.name) != undefined
					}
				})
				return duplicate;
			},

			async isValid() {
				let valid = true;
				
				// clear warnings
				for (let warning of Object.keys(this.warnings)) {
					this.warnings[warning] = "";
				}
				
				if (this.usrInfo.name.split(' ').join('').length == 0) {
					this.warnings.name = '请输入您的真实姓名'; valid = false;
				}
				
				if (this.usrInfo.identity == -1) {
					this.warnings.identity = '请告诉我们您的身份'; valid = false;
				}
				
				let validTKey = await this.validTeacherKey();
				if (this.usrInfo.identity == 0 && !validTKey) {
					this.warnings.teacherKey = 'teacherkey错误'; valid = false;
				}
				
				if (this.usrInfo.identity == 1) {
					if (this.usrInfo.hall == -1) {
						this.warnings.hall = '请选择宿舍'; valid = false;
					}
					else if (this.usrInfo.room == -1) {
						this.warnings.room = '请选择房间'; valid = false;
					}
				}

				let duplicates = await this.existsDuplicates();
				console.log("result from await: "+ duplicates);
				if (duplicates) {
					this.warnings.name = '名字重复了...换一个试试吧'; valid = false;
				}
				
				return valid;
			},

			async register() {
				let valid = await this.isValid();

				if (valid) {
					// ask the user for confirmation
					let title, content;
					let hall, room, dorm;
					
					if (this.usrInfo.identity == 0) {
						title = `您是${this.usrInfo.name}老师吗？`;
						content = '';
					}

					else if (this.usrInfo.identity == 1) {
						hall = this.halls[this.usrInfo.hall];
						room = this.rooms[hall][this.usrInfo.room];
						dorm = `${hall}-${room}`

						title = `您是${dorm}的${this.usrInfo.name}同学吗？`;
						content = '（宿舍楼到时候可以改）';
					}
					
					uni.showModal({
						title: title,
						content: content,
					  	cancelText: '不是！',
						confirmText: '是的:)',

					  	success: (res) => {
					  		if (res.confirm) {
					    		uni.showModal({
					      			title: '要以此身份注册海外假条吗？',
									success: (res) => {
										if (res.confirm) {
											// add user to database
											cloudApi.call({
												name: "register",
												data: {
													dorm: dorm,
													identity: this.usrInfo.identity,
													name: this.usrInfo.name
												},
												success: (res) => {
													uni.setStorage({
														key: "identity",
														data: this.usrInfo.identity == 0 ? "teacher" : "student"
													})
													uni.reLaunch({
														url: '/pages/menu/menu'
													});
												},
												fail: (err) => {
													uni.showToast({
														icon: "none",
														title: "注册发生错误"
													})
												}
											})
										}
									}
								})
							}
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	@import '@/static/global.scss';

	.title {
		margin-top: 250rpx;
		margin-bottom: 100rpx;
	}
	
	.warning {
		font-size: 40rpx;
	}
	
	.btn {
		margin: auto;
		width: 400rpx;
	}
</style>
