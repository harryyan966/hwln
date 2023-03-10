<template>
	<view>
		<back></back>
		<view class="title acc2">{{ note.class }}</view>

		<view class="container">
			<view class="btn" @click="sign('super')" :class="{ clicked: note.ssuper }">{{ note.supervisor }}老师{{ note.ssuper ? "已签字！" :"请点击此处签字" }}</view>
			<view class="btn" @click="sign('class')" :class="{ clicked: note.sclass }">{{ note.homeroom }}老师{{ note.sclass ? "已签字！" : "请点击此处签字" }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-people.svg" class="dimg">
				<view class="dtext">请假学生</view>
			</view>
			<view class="btn content">{{ note.students }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-date.svg" class="dimg">
				<view class="dtext">请假日期</view>
			</view>
			<view class="btn content">{{ note.date }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-message.svg" class="dimg">
				<view class="dtext">请假事由</view>
			</view>
			<view class="btn content">{{ note.message }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-room.svg" class="dimg">
				<view class="dtext">学生宿舍</view>
			</view>
			<view class="btn content">{{ note.dorms }}</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-teacher.svg" class="dimg">
				<view class="dtext">指导老师</view>
			</view>
			<view class="btn content">{{ note.supervisor }}老师</view>

			<view class="description">
				<img src="/static/icons/symbols/a2-teacher.svg" class="dimg">
				<view class="dtext">班主任老师</view>
			</view>
			<view class="btn content">{{ note.homeroom }}老师</view>
		</view>

	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				note: undefined
			}
		},

		onLoad(res) {
			this.note = JSON.parse(res.note)
		},

		methods: {
			sign(type) {
				cloudApi.call({
					name: "sign",
					data: {
						id: this.note._id,
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
