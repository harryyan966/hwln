<template>
	<view>
		<back></back>
		<view class="title dgray">设置</view>

		<view class="container">
			<view class="description" style="margin-bottom: 40rpx;">
				<img src="/static/icons/symbols/g-user.svg" class="dimg">
				<view class="dtext">个人信息</view>
			</view>
			<view class="btn">{{ name }}({{ identity == "teacher" ? "老师" : "学生" }})</view>
			<view v-if="dorm" class="btn">{{ dorm }}</view>

			<!-- 
			this part is supposed to change the user's name, it will be on a later update

			perhaps

			<TextInput
			icon="symbols/g-user.svg"
			placeholder="新的名字"
			@change="e => { nname = e; wnname = '' }"
			:warning="wnname"
			style="margin-bottom: -20rpx;"
			/>

			<view class="btn" @click="changename">更改姓名</view>
			-->

			<!-- change dorm -->
			<view v-if="identity == 'student'" class="description">
				<img src="/static/icons/symbols/g-change.svg" class="dimg">
				<view class="dtext">更改宿舍</view>
			</view>
			<SelectInput
			v-if="identity == 'student'"
			icon="symbols/g-dorm.svg"
			placeholder="新的宿舍楼？"
			color="g"
			@change="e => { ihall = e; iroom = '-1'; whall = '' }"
			:options="halls"
			:warning="whall"
			/>

			<SelectInput
			v-if="identity == 'student'"
			v-show="ihall != -1"
			placeholder="新的房间？"
			color="g"
			icon="symbols/g-room.svg"
			@change="e => { iroom = e; wroom = '' }"
			:options="rooms[halls[ihall]]"
			:warning="wroom"
			style="margin-top: -60rpx;"
			/>

			<view v-if="identity == 'student'" class="btn" @click="changedorm">更改宿舍</view>

			<!-- change teacher key -->
			<TextInput
			v-if="identity == 'teacher'"
			icon="symbols/g-tkey.svg"
			placeholder="旧的「teacherkey」"
			@change="e => { prevkey = e; prevwarn = '' }"
			:warning="prevwarn"
			style="margin-bottom: -60rpx;"
			/>

			<TextInput
			v-if="identity == 'teacher'"
			icon="symbols/w-tkey.svg"
			placeholder="新的「teacherkey」"
			@change="e => { tkey = e; tkeywarn = '' }"
			:warning="tkeywarn"
			/>

			<view v-if="identity == 'teacher'" class="btn" @click="changekey">更改「teacherkey」</view>

			<!-- delete account -->
			<view class="description warning">
				<img src="/static/icons/symbols/w-danger.svg" class="dimg">
				<view class="dtext">注销账号</view>
			</view>
			<view class="btn warning" @click="del">注销！</view>
		</view>
	</view>
</template>

<script>
	import cloudApi from '../../common/cloudApi.js'

	export default {
		data() {
			return {
				name: "",
				identity: "",
				dorm: undefined,

				/*
				// change name
				nname: "",
				wnname: "",
				*/

				// change dorm
				halls: undefined,
				rooms: undefined,
				ihall: -1,
				iroom: -1,
				whall: "",
				wroom: "",

				// change tkey
				tkey: "",
				tkeywarn: "",
				prevkey: "",
				prevwarn: ""
			}
		},

		onLoad() {
			let data = uni.getStorageSync("me")
			this.identity = data.identity
			this.name = data.name
			this.dorm = data.dorm

			if (this.identity == "student") {
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
			}
		},

		methods: {
			/*
			changename() {
				if (this.nname.split(" ").join("").length == 0) {
					this.wnname = "姓名不能为空"
					return
				}
				if (this.nname == this.name) {
					this.wnname = "新旧姓名相同"
					return
				}
				cloudApi.call({
					name: "getUsers",
					data: {
						type: this.identity,
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
						if (res.result.data.find( e => e == this.nname )) {
							this.wnname = "名字重复了...换一个试试吧"
						}
						else {
							cloudApi.call({
								name: "umanage",
								data: {
									query: "changename",
									newname: this.nname,
									identity: this.identity
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
									this.name = this.nname
								}
							})
						}
					}
				})
			},
			*/

			changedorm() {
				if (this.ihall == -1) {
					this.whall = "请选择宿舍楼"
					return
				}
				if (this.iroom == -1) {
					this.wroom = "请选择宿舍"
					return
				}
				let hall = this.halls[this.ihall]
				let room = this.rooms[hall][this.iroom]
				let dorm = hall + "-" + room

				if (dorm == this.dorm) {
					this.wroom = "新旧宿舍相同"
					return
				}

				uni.showModal({
					title: "确认更改宿舍？",
					content: "新宿舍: " + dorm,
					success: (res) => {
						if (res.confirm) {
							cloudApi.call({
								name: "umanage",
								data: {
									query: "changedorm",
									newdorm: dorm,
									identity: this.identity
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
				                	this.dorm = dorm
				                	// TODO: incorporate crel?
				                	uni.setStorage({
										key: "me",
										data: {
											identity: this.identity,
											name: this.name,
											dorm: this.dorm
										}
									})
									uni.showToast({
										icon: "none",
										duration: 1500,
										title: "宿舍更改成功"
									})
								}
							})
						}
					}
				})
			},
			del() {
				uni.showModal({
					title: "确认注销账号？",
					content: "此操作不可撤销！！！！！",
					success: (res) => {
						if (res.confirm) {
							cloudApi.call({
								name: "umanage",
								data: {
									query: "delete",
									identity: this.identity
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
									uni.showToast({
										icon: "none",
										duration: 1500,
										title: "账号删除成功"
									})
									uni.clearStorage()
									uni.reLaunch({
										url: "/pages/index/index"
									})
								}
							})
						}
					}
				})
			},
			changekey() {
				if (this.prevkey == this.tkey) {
					this.tkeywarn = "新旧「teacherkey」相同"
					return
				}
				uni.showModal({
					title: "确认更改「teacherkey」？",
					content: "该密码用作新教师注册",
					success: (res) => {
						if (res.confirm) {
							cloudApi.call({
								name: "keymanage",
								data: {
									query: "change",
									key: this.prevkey,
									new: this.tkey
								},
								success: (res) => {
									if (res.result.err == "user not logged in") {
										uni.navigateTo({
			    							url: "/pages/index/index"
			     						})
			     						uni.showToast({
											icon: "error",
											duration: 1500,
											title: "您尚未登录"
										})
										return
									}
									if (res.result.err == "new key matches the current key") {
			                			this.tkeywarn = "新旧「teacherkey」相同"
				                		return
									}
									if (res.result.err == "incorrect prevkey") {
										this.prevwarn = "旧「teacherkey」不正确"
										return
									}
									if (res.result.err) {
				                		uni.showToast({
				                			icon: "error",
				                			duration: 2000,
				                			title: res.result.err
				                		})
				                		return
				                	}
									uni.showToast({
										icon: "none",
										duration: 1500,
										title: "更改成功"
									})
								}
							})
						}
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
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.description {
		margin-top: 50rpx;
		width: 550rpx;
		display: flex;
	}

	.dimg {
		margin-top: -10rpx;
		max-width: 70rpx;
		max-height: 70rpx;
		margin-right: 50rpx;
	}

	.dtext {
		font-weight: bold;
		font-size: 40rpx;
	}

	.btn {
		margin: 40rpx;
		font-size: 40rpx;
		width: 400rpx;
	}
</style>
