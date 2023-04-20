<template>
	<view class="my-picker">
		<picker @change="handleChange" :range="options" :range-key="rangeKey" :value="index">
			{{ currentValue || placeholoder }}
		</picker>
	</view>
</template>
 
<script>
	export default {
		name: "myPicker",
		props: {
			value: String | Number,
			options: Array,
			rangeKey: {
				type: String,
				default: "label"
			},
			rangeValue: {
				type: String,
				default: "value"
			},
			placeholoder: {
				type: String,
				default: "请选择",
			}
		},
		data() {
			return {
				index: -1
			}
		},
		computed: {
			currentValue() {
				return this.index == -1 ? "" : this.options[this.index][this.rangeKey]
			}
		},
		watch: {
			value(val) {
				this.index = this.options.findIndex(item => item[this.rangeValue] == val);
			}
		},
		methods: {
			handleChange(e) {
				this.index = e.detail.value;
				let currentValue = this.index == -1 ? "" : this.options[this.index][this.rangeValue];
				this.$emit("input", currentValue);
                this.$emit("change", currentValue);
			}
		}
	}
</script>