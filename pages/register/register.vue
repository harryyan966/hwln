<template>
	<view>
		<back></back>
		<view class="title primary">注册 register</view>

		<!-- ask for real name -->
		<TextInput
		icon="symbols/p-user.svg"
		placeholder="!真实! 姓名 name"
		@change="e => { usrInfo.name = e; warnings.name = '' }"
		:warning="warnings.name"
		/>

		<!-- ask for identity -->
		<SelectInput
		icon="symbols/p-identity.svg"
		placeholder="身份 teacher / student"
		@change="e => { usrInfo.identity = e; warnings.identity= '' }"
		:options="['教师 teacher', '学生 student']"
		:warning="warnings.identity"
		/>

		<!-- require teacher key to register as a teacher -->
		<TextInput
		v-show="usrInfo.identity == 0"
		icon="symbols/p-tkey.svg"
		placeholder="「 teacher key 」"
		@change="e => { teacherKey = e; warnings.teacherKey = '' }"
		:warning="warnings.teacherKey"
		/>

		<!-- ask for dorm hall from students -->
		<SelectInput
		v-show="usrInfo.identity == 1"
		icon="symbols/p-dorm.svg"
		placeholder="宿舍楼 dorm hall"
		@change="e => { usrInfo.hall = e; usrInfo.room = '-1'; warnings.hall = '' }"
		:options="halls"
		:warning="warnings.hall"
		/>

		<!-- ask for dorm room from students -->
		<SelectInput
		v-show="usrInfo.identity == 1 && usrInfo.hall != -1"
		placeholder="房间 dorm room"
		icon="symbols/p-room.svg"
		@change="e => { usrInfo.room = e; warnings.room = '' }"
		:options="rooms[halls[usrInfo.hall]]"
		:warning="warnings.room"
		/>

		<!-- submit button -->
		<view class="btn" style="transform: translateY(50rpx);" @click="register">注册 register</view>

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
					if (res.result.err) {
                		uni.showToast({
                			icon: "error",
                			duration: 2000,
                			title: res.result.err
                		})
                		return
                	}
					this.halls = res.result.data.halls
					this.rooms = res.result.data.rooms
				}
			})
		},
		methods: {
			async validTeacherKey() {
				let result
				await cloudApi.call({
					name: "keymanage",
					data: {
						query: "check",
						key: this.teacherKey
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
						// if (!res.result.cmp) {
							// this.warnings.teacherKey = "「teacherkey」错误"
						// }
						console.log(res)
						result = res.result.cmp
					}
				})
				console.log(result)
				return result
			},

			async existsDuplicates() {
				if (this.usrInfo.identity == -1)
					return false
				
				let duplicate = false;
				await cloudApi.call({
					name: "getUsers",
					data: {
						type: this.usrInfo.identity == 0 ? "teacher" : "student",
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
						duplicate = res.result.data.find(e => e == this.usrInfo.name)
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
					this.warnings.name = '请输入您的真实姓名<br>please enter a recognizable name'; valid = false;
				}
				
				if (this.usrInfo.identity == -1) {
					this.warnings.identity = '请告诉我们您的身份<br>please tell us your identity'; valid = false;
				}
				
				if (this.usrInfo.identity == 0) {
					let validkey = await this.validTeacherKey()
					if (!validkey) {
						this.warnings.teacherKey = 'teacherkey错误<br> wrong teacherkey'; valid = false;
					}
				}
				
				if (this.usrInfo.identity == 1) {
					if (this.usrInfo.hall == -1) {
						this.warnings.hall = '请选择宿舍<br>please select a dorm building'; valid = false;
					}
					else if (this.usrInfo.room == -1) {
						this.warnings.room = '请选择房间<br>please select a dorm room'; valid = false;
					}
				}

				let duplicates = await this.existsDuplicates()
				if (duplicates) {
					this.warnings.name = '名字重复了...换一个试试吧<br>another person took your name'; valid = false;
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
											uni.login({
												provider: "weixin",
												success: (res) => {
													let code = res.code
													// add user to database
													cloudApi.call({
														name: "register",
														data: {
															dorm: dorm,
															identity: this.usrInfo.identity,
															name: this.usrInfo.name,
															code: code
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
															uni.setStorage({
																key: "me",
																data: res.result.me
															})

															uni.reLaunch({
																url: '/pages/menu/menu'
															});
														},
														fail: (err) => {
															uni.showToast({
																icon: "none",
																duration: 1500,
																title: "注册发生错误"
															})
														}
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
