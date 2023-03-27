<template>
	<view>
		<view class="checkbox-container" v-if="options">
			<view class="checkbox-group">
				<view v-for="option,index in options" :key="index" class="option" 
				:class="{ active: selected[index] }" 
				@click="() => $emit('change', index)">{{ option }}</view>
			</view>
			<span class="warning" v-html="warning"></span>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['options', 'selected', 'warning'],
	}
</script>

<style lang="scss">
	@import '../common.scss';	
	
	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		margin: auto;
		padding: 20rpx;
		
		width: 600rpx;
		box-shadow: inset 8rpx 8rpx 8rpx $shadow,
		            inset -8rpx -8rpx 8rpx white;
	}
	
	.option {
		box-shadow: 8rpx 8rpx 8rpx $shadow,
		            -8rpx -8rpx 8rpx white;
		// background-color: $accent-1;
		
		border-radius: 20rpx;
		height: 80rpx;
		width: 44%;
		margin: 2%;
		
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}
	
	.active {
		background-color: $accent-1;
		color: white;
		box-shadow: none;
	}
	
	.checkbox-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>