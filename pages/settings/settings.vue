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
			/>

			<view v-if="identity == 'student'" class="btn" @click="changedorm">更改宿舍</view>

			<!-- change teacher key -->
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
				// change dorm
				halls: undefined,
				rooms: undefined,
				ihall: -1,
				iroom: -1,
				whall: "",
				wroom: "",

				// change tkey
				tkey: ""
			}
		},

		onLoad() {
			cloudApi.call({
				name: "getDorms",
				success: (res) => {
					if (res.result.err) {
                		uni.showToast({
                			icon: "error",
                			title: "error: " + res.result.err
                		})
                		return
                	}
					this.halls = res.result.data.halls
					this.rooms = res.result.data.rooms
				}
			})
			uni.getStorage({
				key: "me",
				success: (res) => {
					this.identity = res.data.identity
					this.name = res.data.name
					this.dorm = res.data.dorm
				}
			})
		},

		methods: {
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

				uni.showModal({
					title: "确认更改宿舍？",
					content: "新宿舍: " + dorm,
					success: (res) => {
						if (res.confirm) {
							cloudApi.call({
								name: "umanage",
								data: {
									query: "newdorm",
									newdorm: dorm,
									identity: this.identity
								},
								success: (res) => {
									if (res.result.err) {
				                		uni.showToast({
				                			icon: "error",
				                			title: res.result.err
				                		})
				                		return
				                	}
				                	this.dorm = dorm
									uni.showToast({
										icon: "none",
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
				                			title: res.result.err
				                		})
				                		return
				                	}
									uni.showToast({
										icon: "none",
										title: "账号删除成功"
									})
									uni.reLaunch({
										url: "/pages/index/index"
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
