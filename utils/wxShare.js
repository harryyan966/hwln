export default {
    data() {
        return {
            share: {
                title: '海外假条 Haiwai Leave Notes',
                path: '/pages/index/index',
                // local file or online iage (png / jpg)
                imageUrl: ''
            }
        }
    },
    onShareAppMessage(res) {
		/*
        // get current page
        let pages = getCurrentPages(),
            // get current view
            view = pages[pages.length - 1];
        this.share.path = `/${view.route}`;
        */

        return this.share;
    }
}