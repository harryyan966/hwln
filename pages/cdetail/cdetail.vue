<template>
	<view>
		<back></back>
		<view class="title acc3">{{ detail.name }}</view>

		<view class="container">
			<!-- detailed information -->
			<view class="description">
				<img src="/static/icons/symbols/a3-teacher.svg" class="dimg" style="margin-top: -10rpx; margin-right: 40rpx;">
				<view class="dtext">班主任老师</view>
			</view>
			<view class="btn">{{ detail.teacher }}老师</view>

			<view v-if="detail ? detail.pending.length : false" class="description">
				<img src="/static/icons/symbols/a3-pending.svg" class="dimg" style="margin-top: -10rpx; margin-right: 40rpx;">
				<view class="dtext">希望加入班级的学生</view>
			</view>
			<view v-for="p,i in detail.pending" :key="i" class="content">
				<view class="btn">{{ p }}</view>
				<img v-if="identity == 'teacher' && related" src="/static/icons/actions/a3-accept.svg" class="btn dimg" @click="act('accept',p)">
				<img v-if="identity == 'teacher' && related" src="/static/icons/actions/a3-deny.svg" class="btn dimg" @click="act('deny',p)">
			</view>

			<view v-if="detail ? detail.students.length : false" class="description">
				<img src="/static/icons/symbols/a3-people.svg" class="dimg" style="margin-top: -10rpx; margin-right: 40rpx;">
				<view class="dtext">学生</view>
			</view>
			<view v-for="s,i in detail.students" :key="i" class="content">
				<view class="btn">{{ s }}</view>
				<img v-if="identity == 'teacher' && related" src="/static/icons/actions/wn-remove.svg" class="btn dimg" @click="act('remove',s)">
			</view>

			<!-- dangerous operations: remove, transfer, quit -->
			<view v-if="related" class="description">
				<img src="/static/icons/symbols/a3-danger.svg" class="dimg" style="margin-top: -10rpx; margin-right: 40rpx;">
				<view class="dtext">危险操作</view>
			</view>
			<view v-if="related" class="container">
				<view v-if="identity == 'teacher'" class="btn warning" @click="remove">转让或删除班级</view>
				<view v-if="identity == 'student'" class="btn warning" @click="quit">退出班级</view>
			</view>
			<view v-if="identity == 'student' && !related" class="description">
				<img src="/static/icons/symbols/a3-danger.svg" class="dimg" style="margin-top: -10rpx; margin-right: 40rpx;">
				<view class="dtext">加入班级</view>
			</view>
			<view v-if="identity == 'student' && !related" class="btn acc3" @click="join">加入班级</view>
		</view>
	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js";

	export default {
		data() {
			return {
				identity: "",
				detail: undefined,
				related: false
			}
		},

		onLoad(e) {
			uni.getStorage({
				key: "me",
				success: (res) => {
					this.identity = res.data.identity
					cloudApi.call({
						name: "getClasses",
						data: {
							query: "cdetail",
							cname: e.cname,
							identity: res.data.identity
						},
						success: (res) => {
							if (res.result.err == "user not logged in") {
								uni.navigateTo({
	    							url: "/pages/index/index"
	     						})
	     						uni.showToast({
									icon: "error",
									title: "您尚未登录"
								})
								return
							}
							if (res.result.err) {
								return
							}
							console.log(res)
							this.detail = res.result.data.cdetail
							console.log(this.detail)
							this.related = res.result.data.isRelated
						}
					})
				}
			})
		},

		methods: {
			act(query, name) {
				let title;
				if (query == "accept") 
					title = "确认接受" + name + "加入" + this.detail.name + "吗？"
				if (query == "deny") 
					title = "确认拒绝" + name + "加入" + this.detail.name + "吗？"
				if (query == "remove") 
					title = "确认将" + name + "移出" + this.detail.name + "吗？"

				uni.showModal({
					title: title,
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								icon: "success",
								title: "操作成功"
							})
						}
					}
				})
				cloudApi.call({
					name: "cmanage",
					data: {
						query: query,
						who: name,
						cname: this.detail.name
					},
					success: (res) => {
						// handle errors
						if (res.result.err == "user not logged in") {
							uni.navigateTo({
								url: "/pages/index/index"
	 						})
	 						uni.showToast({
								icon: "error",
								title: "您尚未登录"
							})
							return
						}
						if (res.result.err == "not authorized") {
							uni.showToast({
								icon: "error",
								title: "权限不足"
							})
							return
						}
						if (res.result.err == "the student haven't requested for the join" || res.result.err == "the student is not in the class") {
							uni.showToast({
								icon: "error",
								title: "操作失败，刷新下试试~"
							})
							return
						}
						if (res.result.err) {
	                		uni.showToast({
	                			icon: "error",
	                			title: "error: " + res.result.err
	                		})
	                		return
	                	}
						// update interface
						if (query == "accept") {
							this.detail.students.push(name)
							this.detail.pending = this.detail.pending.filter( e => e != name )
						}
						else if (query == "deny") {
							this.detail.pending = this.detail.pending.filter( e => e != name )
						}
						else if (query == "remove") {
							this.detail.students = this.detail.students.filter( e => e != name )
						}
					}
				})
			},
			remove() {
				uni.navigateTo({
					url: "/pages/ctransfer/ctransfer?cname=" + this.detail.name
					+ "&curr=" + this.detail.teacher
				})
			},
			quit() {
				cloudApi.call({
					name: "umanage",
					data: {
						query: "quit",
						identity: this.identity
					},
					success: (res) => {
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
						if (res.result.err) {
	                		uni.showToast({
	                			icon: "none",
	                			title: "error: " + res.result.err
	                		})
	                		return
	                	}
                		uni.showToast({
                			icon: "success",
                			title: "成功退出班级"
                		})
                		uni.getStorage({
                			key: "me",
                			success: (res) => {
                				this.detail.pending = this.detail.pending.filter( e => e != res.data.name )
		                		this.detail.students = this.detail.students.filter( e => e != res.data.name )
		                		this.related = false
                			}
                		})
					}
				})
			},
			join() {
				cloudApi.call({
					name: "umanage",
					data: {
						query: "join",
						identity: this.identity,
						cname: this.detail.name
					},
					success: (res) => {
						if (res.result.err == "user not logged in") {
							uni.navigateTo({
								url: "/pages/index/index"
							})
							uni.showToast({
								icon: "error",
								title: "您尚未登录"
							})
							return
						}
						if (res.result.err == "cannot join more than one classes") {
							uni.showToast({
								icon: "error",
								title: "加入班级过多"
							})
							return
						}
						if (res.result.err) {
	                		uni.showToast({
	                			icon: "error",
	                			title: res.result.err
	                		})
	                		return
	                	}
                		uni.showToast({
                			icon: "success",
                			title: "申请成功"
                		})
                		uni.getStorage({
                			key: "me",
                			success: (res) => {
                				this.detail.pending.push(res.data.name)
		                		this.related = true
                			}
                		})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "@/static/global.scss";

	.title {
		margin-bottom: 100rpx;
	}

	.container {
		margin: auto;
		width: 550rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.btn {
		width: 100%;
		margin: 40rpx 10rpx;
		font-size: 40rpx;
		font-weight: normal;
	}

	.description {
		width: 550rpx;
		margin-bottom: 20rpx;
		display: flex;
	}

	.dimg {
		max-width: 70rpx;
		max-height: 70rpx;
		flex-grow: 1;
	}

	.dtext {
		font-weight: bold;
		font-size: 40rpx;
	}

	.content {
		width: 650rpx;
		display: flex;
	}
</style>