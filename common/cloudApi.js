// store the JWT here
let token;


// CREDITS: https://blog.csdn.net/AP0906424/article/details/121556612

let isShowLoading = false;
let isShowToast = false;
const {
  showLoading,
  hideLoading,
  showToast,
  hideToast
} = wx;
Object.defineProperty(wx, 'showLoading', {
  configurable: true, // 是否可以配置
  enumerable: true, // 是否可迭代
  writable: true, // 是否可重写
  value(...param) {
    if (isShowToast) { // Toast优先级更高
      return;
    }
    isShowLoading = true;
    return showLoading.apply(this, param); // 原样移交函数参数和this
  }
});
Object.defineProperty(wx, 'hideLoading', {
  configurable: true, // 是否可以配置
  enumerable: true, // 是否可迭代
  writable: true, // 是否可重写
  value(...param) {
    if (isShowToast) { // Toast优先级更高
      return;
    }
    isShowLoading = false;
    return hideLoading.apply(this, param); // 原样移交函数参数和this
  }
});
Object.defineProperty(wx, 'showToast', {
  configurable: true, // 是否可以配置
  enumerable: true, // 是否可迭代
  writable: true, // 是否可重写
  value(...param) {
    if (isShowLoading) { // Toast优先级更高
      wx.hideLoading();
    }
    isShowToast = true;
    return showToast.apply(this, param); // 原样移交函数参数和this
  }
});
Object.defineProperty(wx, 'hideToast', {
  configurable: true, // 是否可以配置
  enumerable: true, // 是否可迭代
  writable: true, // 是否可重写
  value(...param) {
    isShowToast = false;
    return hideToast.apply(this, param); // 原样移交函数参数和this
  }
});

function call(option) {
  return new Promise((resolve, reject) => {
    // catch null data
    if (!option.data) {
      option.data = {};
    }

    // if there is token, pass in the token when calling the unicloud function
    if (token) {
      option.data.token = token;
    }

    // show a loading while calling the unicloud function
    uni.showLoading();

    // call the function with the token
    uniCloud.callFunction({
      name: option.name,
      data: option.data,

      success(res) {
        uni.hideLoading();

        // storing the token if the function called returned a token for us
        if (res.result.token) {
          token = res.result.token;
        }
        console.log(option.name)
        if (option.name == "umanage" && option.data.query == "delete")
          token = undefined
        // retain original behavior
        if (option.success) {
          option.success(res);
        }
        // return result
        resolve(res);
      },

      fail(err) {
        uni.hideLoading();

        // retain original behavior
        if (option.fail) {
          option.fail(err);
        }
        // return error
        resolve(err);
      },

      complete() {
        // uni.hideLoading();

        // retain original behavior
        if (option.complete) {
          option.complete()
        }
      }
    })
  })
}

module.exports = {
  call: call
}