// store the JWT here
let token;

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
        // storing the token if the function called returned a token for us
        if (res.result.token) {
          token = res.result.token;
        }
        // retain original behavior
        if (option.success) {
          option.success(res);
        }
        // return result
        resolve(res);
      },

      fail(err) {
        // retain original behavior
        if (option.fail) {
          option.fail(err);
        }
        // return error
        resolve(err);
      },

      complete() {
        uni.hideLoading();

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