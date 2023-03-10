<template>
	<view>
		<back></back>
		<view class="title acc3">班级册</view>
		
		<view class="container">
			<view v-for="c,i in cnames" :key="i" class="btn" @click="detail(c)">{{ c }}</view>
			<navigator v-if="identity == 'teacher'" url="/pages/ccreate/ccreate" class="btn acc3">创建班级</navigator>
		</view>
	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				cnames: undefined,
				identity: ""
			}
		},

		onLoad() {
			uni.getStorage({
				key: "me",
				success: (res) => {
					this.identity = res.data.identity
					cloudApi.call({
						name: "getClasses",
						data: {
							query: "cview"
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
							this.cnames = res.result.data.cnames
						}
					})
				}
			})
		},

		methods: {
			detail(cname) {
				uni.navigateTo({
					url: "/pages/cdetail/cdetail?cname=" + cname
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
		font-size: 50rpx;
		flex-direction: column;
	}
</style>
