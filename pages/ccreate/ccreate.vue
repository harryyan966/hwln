<template>
	<view>
		<back></back>
		<view class="title acc3">创建班级<br>create class</view>

		<view class="container">
			<!-- get name of class to be created -->
			<TextInput
			icon="symbols/a3-class.svg"
			placeholder="班级名称 class name"
			@change="e => { cname = e; cnamewarn = '' }"
			:warning="cnamewarn"
			/>

			<view class="btn acc3" @click="create">创建 create</view>
		</view>
	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				cname: "",
				cnamewarn: ""
			}
		},
		methods: {
			create() {
				// sanity check
				if (this.cname.split(" ").join("").length == 0) {
					this.cnamewarn = "班级名称不能为空<br>please give a name to the class"
					return
				}

				// confirm
				uni.showModal({
		            title: '确认创建班级？do you want to create the class?',
		            content: this.cname,
		            success: (res) => {
		              	if (res.confirm) {
		              		// create class
			                cloudApi.call({
				                name: "cmanage",
				                data: {
				                    query: "create",
				                    cname: this.cname
				                },
				                success: (res) => {
				                	// handle error
				                	if (res.result.err == "user not logged in") {
				                		uni.navigateTo({
			    							url: "/pages/index/index"
			     						})
			     						uni.showToast({
											icon: "none",
											title: "您尚未登录"
										})
			     						return
				                	}
				                	if (res.result.err == "duplicate class name") {
				                		this.cnamewarn = "名字重复了，换一个试试吧<br>another class took your name"
				                		return
				                	}
				                	if (res.result.err) {
				                		uni.showToast({
				                			icon: "error",
				                			title: res.result.err
				                		})
				                		return
				                	}
				                	// return to class view
				                	console.log(res)
				                	uni.navigateBack({
				                		delta: 2
				                	})
					            }
				            })
			       		}
		            }
		        })
			}
		}
	}
</script>

<style lang="scss">
	@import "@/static/global.scss";

	.container {
		margin-top: 100rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.btn {
		margin-top: 50rpx;
		width: 400rpx;
	}
</style>
