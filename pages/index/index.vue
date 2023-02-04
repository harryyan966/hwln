<template>
	<view>
		<view class="container">
			<view class="title primary">海外假条</view>
			<navigator url="/pages/register/register" class="btn">微信登录/注册</navigator>
		</view>
	</view>
</template>

<script>
	import cloudApi from '../../common/cloudApi.js';

	export default {
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
							console.log(res)
							if (res.result.userInfo) {
								uni.setStorage({
									key: "identity",
									data: res.result.identity
								})
								uni.reLaunch({
									url: "/pages/menu/menu"
								})
							}
						},
						fail: (err) => {
							uni.showToast({
								icon:'none',
								title:'登录失败'
							});
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
		margin-top: 500rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.btn {
		width: 400rpx;
		margin-top: 200rpx;
	}
</style>
