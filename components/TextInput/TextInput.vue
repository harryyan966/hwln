<template>
	<view>
		<view class="container">
			<view class="f-container">
				<img v-if="icon" :src="'/static/icons/' + icon" class="icon">
				<view>
				<input type="text" v-model="inputData" class="input" @input="$emit('change', inputData)" :placeholder="placeholder">
				</view>
			</view>
			<span class="warning" v-html="warning"></span>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['icon', 'placeholder', 'warning'],
		
		data() {
			return {
				inputData: ""
			}
		}
	}
</script>

<style lang="scss">
	@import '../common.scss';
	
	.input {		
		height: 50rpx;
		padding: 25rpx;
		width: 390rpx;
		border-radius: 10rpx;
		box-shadow: inset $shadow-delta $shadow-delta $shadow-size $shadow,
            inset (-$shadow-delta) (-$shadow-delta) $shadow-size white;
		// font-weight: lighter;
		font-size: 40rpx;
	}
</style>