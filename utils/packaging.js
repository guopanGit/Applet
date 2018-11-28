/*
 * 请求封装
 * @url  请求地址
 * @data 请求参数
 * @successCall 成功回调
 * @failCall 失败回调
 */
export function $getData(url, data, successCall, failCall) {
	wx.showLoading({
		title: '加载中...',
		mask: true,
	});
	wx.request({
		url: url,
		data: data,
		header: {
			"Content-Type": "application/x-www-form-urlencoded",
			'Accept': 'application/json'
		},
		method: 'GET',
		success: (res) => {
			successCall(res)
		},
		fail: (res) => {
			if (failCall) {
				failCall(res);
			}
		},
	})
};

export function $postData(url, data, successCall, failCall) {
	wx.showLoading({
		title: '加载中...',
		mask: true,
	});
	wx.request({
		url: url,
		data: data,
		header: {
			"Content-Type": "application/x-www-form-urlencoded",
			'Accept': 'application/json'
		},
		method: 'POST',
		success: (res) => {
			if (res.data.resultCode == 200) {
				successCall(res)
			}
		},
		fail: (res) => {
			if (failCall) {
				failCall(res);
			}
		},
	})
}

/*
 * 弱提示封装
 * @title 提示内容
 */
export function $showToast(title) {
	wx.showToast({
		title: title,
		icon: 'none',
		duration: 2000,
	})
}

/*
 * 微信支付封装
 * @data 参数对象
 * @successCall 成功回调
 * @failCall 失败回调
 */
export function $requestPayment(data, successCall, failCall) {
	wx.showLoading({
		title: '加载中...',
		mask: true,
	})
	wx.requestPayment({
		timeStamp: data.timeStamp,
		nonceStr: data.nonceStr,
		package: data.package,
		signType: 'MD5',
		paySign: data.paySign,
		success: (res) => {
			successCall(res);
		},
		fail: (res) => {
			if (failCall) {
				failCall(res);
			}
		},
	})
}