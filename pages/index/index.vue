<template>
	<view>
		<view class="container">
			<view class="title primary">海外假条</view>
			<navigator v-show="loaded" url="/pages/register/register" class="btn">微信登录/注册</navigator>
		</view>
	</view>
</template>

<script>
	import cloudApi from '../../common/cloudApi.js';

	export default {
		data() {
			return {
				loaded: false
			}
		},
		onLoad() {
			// get user info with wechat's API
			uni.login({
				provider: "weixin",
				success: (res) => {
					let code = res.code

					cloudApi.call({
						name: "login",
						data: {
							code: code
						},
						success: (res) => {
							if (res.result.err) {
		                		uni.showToast({
		                			icon: "error",
		                			title: "error: " + res.result.err
		                		})
		                		return
		                	}
							if (res.result.userInfo) {
								uni.setStorage({
									key: "identity",
									data: res.result.identity
								})
								uni.setStorage({
									key: "name",
									data: res.result.userInfo.name
								})
								uni.reLaunch({
									url: "/pages/menu/menu"
								})
							}
						},
						fail: (err) => {
							uni.showToast({
								icon:'error',
								title:'登录失败'
							});
						},
						complete: (e) => {
							console.log(e)
							this.loaded = true
						}
					})
				}
			})
		}
	}
</script>

<style lang="scss">
	@import '@/static/global.scss';

	.container {
		margin-top: 250rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.btn {
		width: 400rpx;
		margin-top: 200rpx;
	}
</style>
