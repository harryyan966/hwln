<template>
	<view>
		<view class="title primary">主菜单</view>
		<view class="container">
			<navigator url="/pages/write/write" class="btn acc1">写假条</navigator>
			<navigator url="/pages/view/view" class="btn acc2">假条本</navigator>
			<navigator url="/pages/cview/cview" class="btn acc3">班级册</navigator>
			<navigator url="/pages/settings/settings" class="btn dgray">设置</navigator>
		</view>
	</view>
</template>

<script>
	export default {
	}
</script>

<style lang="scss">
	@import '@/static/global.scss';

	.title {
		margin-bottom: 100rpx;
	}

	.btn {
		margin: 50rpx;
		width: 400rpx;
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
