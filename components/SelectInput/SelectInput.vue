<template>
	<view>
		<view class="container">
			<view class="f-container">
				<img v-if="icon" :src="'/static/icons/' + icon" class="icon">
				<picker @change="change" :range="options" :value="index">
					<view class="select">
						<span :style="'color: ' + textColor" style="width: 300rpx;">{{ options[index] || placeholder }}</span>
						<img :src="dropdownSrc" class="dropdown">
					</view>
				</picker>
			</view>
			<span class="warning" v-html="warning"></span>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['icon', 'options', 'warning', 'placeholder', 'color'],
		
		data() {
			return {
				index: -1
			}
		},
		methods: {
			change(e) {
				this.index = e.detail.value;
				this.$emit('change', this.index)
			}
		},
		computed: {
			textColor() {
				return this.index == -1 ? 'grey' : 'black';
			},
			dropdownSrc() {
				return `/static/icons/dropdowns/${this.color || "p"}.svg`;
			}
		}
	}
</script>

<style lang="scss">
	@import '../common.scss';
	
	.select {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		
		height: 80rpx;
		width: 410rpx;
		padding: 15rpx;
		border-radius: 10rpx;
    	box-shadow: $shadow-delta $shadow-delta $shadow-size $shadow,
            (-$shadow-delta) (-$shadow-delta) $shadow-size white;
		// font-weight: lighter;
		font-size: 40rpx;
	}
	
	.dropdown {
		margin-top: 10rpx;
		width: 50rpx;
		height: 100%;
	}
</style>