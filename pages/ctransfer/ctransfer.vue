<template>
	<view>
		<back></back>
		<view class="title acc3">转让或删除{{ cname }}<br>transfer or remove {{ cname }}</view>

		<view class="container">
			<SelectInput
		    icon="symbols/a3-teacher.svg"
		    placeholder="转让对象 transfer to whom?"
		    color="a3"
		    @change="e => { selected = e; warning = '' }"
		    :options="teachers"
		    :warning="warning"
		    />

			<view class="btn acc3" @click="act" v-html="q"></view>
		</view>
	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				cname: "",
				teachers: undefined,
				selected: -1,
				warning: ""
			}
		},

		onLoad(e) {
			this.cname = e.cname
			let curr = e.curr

			cloudApi.call({
				name: "getUsers",
				data: {
					type: "teacher",
					field: "name"
				},
				success: (res) => {
					if (res.result.err) {
                		uni.showToast({
                			icon: "error",
                			duration: 2000,
                			title: res.result.err
                		})
                		return
                	}
					this.teachers = res.result.data
					this.teachers = this.teachers.filter( e => e != curr )
					this.teachers.push(["「删除班级！DELETE」"])
				}
			})
		},

		methods: {
			act() {
				if (this.selected == -1) {
					this.warning = "请选择教师"
					return
				}
				let q = this.selected == this.teachers.length - 1 ? "delete" : "transfer"
				let title = this.selected == this.teachers.length - 1 ? "确认删除" + this.cname + "？" : "确认转让" + this.cname + "给" + this.teachers[this.selected] + "老师？"

				uni.showModal({
		            title: title,
		            success: (res) => {
		              	if (res.confirm) {
			                cloudApi.call({
				                name: "cmanage",
				                data: {
				                    query: q,
				                    cname: this.cname,
				                    to: q == "transfer" ? this.teachers[this.selected] : undefined
				                },
				                success: (res) => {
				                	if (res.result.err == "user not logged in") {
				                		uni.navigateTo({
			    							url: "/pages/index/index"
			     						})
			     						uni.showToast({
											icon: "none",
											duration: 1500,
											title: "您尚未登录"
										})
			     						return
				                	}
            						if (res.result.err) {
				                		uni.showToast({
				                			icon: "error",
				                			duration: 2000,
				                			title: res.result.err
				                		})
				                		return
				                	}
				                	uni.showModal({
										icon: "success",
										title: (q == "transfer" ? "转让" : "删除") + "成功",
										showCancel: false
									})
				                	uni.navigateBack({
				                		delta: 3
				                	})
					            }
				            })
			       		}
		            }
		        })
			}
		},

		computed: {
			q() {
				if (!this.teachers)
					return "转让"
				return this.selected < this.teachers.length - 1 ? "转让班级<br>transfer class" : "删除班级<br>delete class"
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
