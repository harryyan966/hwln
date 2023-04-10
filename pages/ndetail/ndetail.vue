<template>
	<view>
		<back></back>
		<view class="title acc2">{{ note.class }}</view>

		<view class="container">
			<view class="btn" @click="sign('super')" :class="{ clicked: note.ssuper }">
				{{ note.supervisor }}老师{{ note.ssuper ? "已签字!" :"请点击确认" }}<br>
				{{ note.ssuper ? "supervisor has signed!" :"supervisor pls sign here" }}
			</view>
			<view class="btn" @click="sign('class')" :class="{ clicked: note.sclass }">
				{{ note.homeroom }}老师{{ note.sclass ? "已签字!" : "请点击确认" }}<br>
				{{ note.sclass ? "homeroom teacher has signed!" : "homeroom teacher pls sign here" }}
			</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-people.svg" class="dimg">
				<view class="dtext">请假学生 students</view>
			</view>
			<view class="btn content">{{ note ? note.students.join("，") : "" }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-date.svg" class="dimg">
				<view class="dtext">请假日期 date</view>
			</view>
			<view class="btn content">{{ note.date }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-message.svg" class="dimg">
				<view class="dtext">请假事由 reason</view>
			</view>
			<view class="btn content">{{ note.message }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-room.svg" class="dimg">
				<view class="dtext">学生宿舍 dorms</view>
			</view>
			<view class="btn content">{{ note.dorms }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-teacher.svg" class="dimg">
				<view class="dtext">指导老师 supervisor</view>
			</view>
			<view class="btn content">{{ note.supervisor }}老师</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-teacher.svg" class="dimg">
				<view class="dtext">班主任老师<br>homeroom teacher</view>
			</view>
			<view class="btn content">{{ note.homeroom }}老师</view>
		</view>

		<view class="btn warning" @click="delnote" v-if="involved" style="margin: 50rpx auto">删除假条</view>
		<!-- placeholder -->
		<view style="height: 50rpx"></view>
	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				note: undefined,
				name: undefined
			}
		},

		onLoad(res) {
			this.note = JSON.parse(res.note)
			let data = uni.getStorageSync("me")
			this.name = data.name
		},

		methods: {
			sign(type) {
				cloudApi.call({
					name: "nmanage",
					data: {
						id: this.note._id,
						query: "sign",
						type: type
					},
					success: (res) => {
						if (res.result.err == "user not logged in") {
							uni.navigateTo({
    							url: "/pages/index/index"
     						})
     						uni.showToast({
								icon: "none",
								duration: 1500,
								title: "您尚未登录"
							})
     						return
						}
						if (res.result.err == "not authorized") {
							uni.showToast({
								icon: "none",
								duration: 1500,
								title: "暂无权限签字"
							})
							return
						}
						if (res.result.err == "nonexistent note") {
							uni.navigateTo({
    							url: "/pages/menu/menu"
     						})
							uni.showToast({
								icon: "none",
								duration: 1500,
								title: "假条不存在"
							})
							return
						}
						if (res.result.err) {
	                		uni.showToast({
	                			icon: "error",
	                			duration: 1500,
	                			title: res.result.err
	                		})
	                		return
	                	}
						if (type == "super") this.note.ssuper = !this.note.ssuper
						if (type == "class") this.note.sclass = !this.note.sclass
					}
				})
			}, 

			delnote() {
				cloudApi.call({
					name: "nmanage",
					data: {
						id: this.note._id,
						query: "del"
					},
					success: (res) => {
						if (res.result.err == "user not logged in") {
							uni.navigateTo({
    							url: "/pages/index/index"
     						})
     						uni.showToast({
								icon: "none",
								duration: 1500,
								title: "您尚未登录"
							})
     						return
						}
						uni.navigateBack({
							delta: 1
						})
					},
					complete: (res) => {
						uni.hideLoading()
						uni.showToast({
							icon: "success",
							title: "删除成功"
						})
					}
				})
			}
		},

		computed: {
			involved() {
				console.log(this.note)
				console.log(this.name)

				return this.note ? (this.note.students.includes(this.name)
				|| this.note.supervisor == this.name
				|| this.note.homeroom == this.name
				|| this.note.writer == this.name) : false
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

	.btn {
		width: 550rpx;
		margin: 40rpx;
		font-size: 40rpx;
	}

	.description {
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

	.content {
		font-weight: normal;
	}

	.clicked {
		background-color: lighten($accent-2,30%);
	}
</style>
