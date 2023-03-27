<template>
	<view>
		<view class="title primary">主菜单<br>menu</view>
		<view class="container">
			<navigator url="/pages/write/write" class="btn acc1">写假条 write</navigator>
			<navigator url="/pages/view/view" class="btn acc2">假条本 notes</navigator>
			<navigator url="/pages/cview/cview" class="btn acc3">班级 classes</navigator>
			<navigator url="/pages/settings/settings" class="btn dgray">设置 settings</navigator>
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
