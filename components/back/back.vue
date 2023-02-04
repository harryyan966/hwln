<template>
	<view>
		<navigator open-type="navigateBack" class="container-back">
            <img src="/static/icons/back.svg" class="img-back">
        </navigator>
	</view>
</template>

<script>
	export default {
		name:"back"
	}
</script>

<style>
	.container-back {
		position: absolute;
		top: 15%;
		left: 5%;
		padding: 40rpx;
		height: 60rpx;
		width: 60rpx;
	}

	.img-back {
		height: 100%;
		width: 100%;
	}
</style>