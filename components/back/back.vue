<template>
	<view>
		<navigator open-type="navigateBack" class="container-back">
            <img src="/static/icons/actions/back.svg" class="img-back">
        </navigator>
        <navigator url="/pages/index/index" class="container-home" open-type="reLaunch">
            <img src="/static/icons/actions/home.svg" class="img-back">
        </navigator>
	</view>
</template>

<script>
	export default {
		name:"back"
	}
</script>

<style>
	.container-back, .container-home {
		position: absolute;
		padding: 40rpx;
		height: 60rpx;
		width: 60rpx;
	}

	.container-back {
		top: 15%;
		left: 5%;
	}

	.container-home {
		top: 15%;
		right: 5%;
	}

	.img-back, .img-home {
		height: 100%;
		width: 100%;
	}
</style>