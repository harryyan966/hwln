<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import '@/static/global.scss';

	body {
    background-color: $gray;
    font-family: "Product Sans", "Arial" !important;
}
</style>
