<template>
	<view>
		<back></back>
		<view class="title acc2">假条本</view>
		
		<!-- display notes -->
		<view class="container">
			<view v-if="notes ? notes.length == 0 : false" class="twarn warning">没有与您相关的假条哦</view>
			<view v-else v-for="note, index in notes" :key="index" class="btn" 
			:class="{ signed: note.ssuper && note.sclass }" @click="detail(index)">
				
				<view class="info acc2">
					<view>{{ note.date }}</view>
					<view>{{ note.class }}</view>
				</view>
				<view class="message">请假原因：{{ note.message.slice(0,27) == note.message ? note.message : note.message.slice(0,27) + "..." }}</view>
				
			</view>
		</view>
	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				identity: -1,
				notes: undefined
			}
		},

		onShow() {
			uni.getStorage({
				key: "me",
				success: (res) => {
					cloudApi.call({
						name: "getNotes",
						data: {
							identity: res.data.identity
						},
						success: (res) => {
							if (res.result.err == "user not logged in") {
								uni.navigateTo({
									url: "/pages/index/index"
								})
								uni.showToast({
									icon: "none",
									title: "您尚未登录"
								})
								return
							}
							if (res.result.err) {
		                		uni.showToast({
		                			icon: "error",
		                			title: "error: " + res.result.err
		                		})
		                		return
		                	}
							console.log(res)
							this.notes = res.result.notes
						},
						fail: (err) => {
							console.log(err)
							uni.navigateTo({
								url: "/pages/index/index"
							})
						}
					})
				},
				fail: (err) => {
					console.log(err)
					uni.navigateTo({
						url: "/pages/index/index"
					})
					uni.showToast({
						icon: "none",
						title: "an error occurred"
					})
				}
			})
			
		},


		methods: {
			detail(index) {
				uni.navigateTo({
					url: "/pages/ndetail/ndetail?note=" + JSON.stringify(this.notes[index])
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
		margin-top: 20rpx;
		margin-bottom: 20rpx;
		width: 500rpx;
		font-size: 40rpx;
		flex-direction: column;

		.info {
			width: 100%;
			display: flex;
			justify-content: space-between;
		}

		.message {
			margin-top: 30rpx;
			font-weight: normal;
		}
	}

	.signed {
		background-color: lighten($accent-2,40%);
	}
</style>
