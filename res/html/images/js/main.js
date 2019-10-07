$(function () {


	// $(document).keyup(function (e) {
	// 	var keycode = event.keyCode ? event.keyCode : e.which;
	// 	//var realkey = String.fromCharCode(keycode);
	// 	if (keycode == 116 || keycode == 82) {
	// 		location.reload();
	// 	}
	// });

	$(document.body).on('click','.e_link', function(){
		event.preventDefault();
		ajax_json('/api/open_url',{
			url:$(this).attr('href')
		}, function (resp){
			if(resp.result > 0){
				my_alert(resp.message);
				return;
			}
			
		});	 
	});
});
var downFromMap = {
	sheshou: {
		title: '射手'
	},
	xunlei: {
		title: '迅雷'
	},
	zimuku: {
		title: '字幕库'
	},
	subhd: {
		title: 'SubHD'
	}

};
//复制文字
function copy_clipboard(str) {
	ajax_json('/api/copy_clipboard', {
		data: str
	}, function (data) {
		if (data.result > 0) {
			my_alert(data.message);
			return;
		}
		my_tip('复制成功');
	});
}

function json_encode(data) {
	return JSON.stringify(data);
}
function json_decode(data) {
	////data = $.parseJSON(data);
	return JSON.parse(data);
}

function ajax_jsonp(url, data, succ_fun, fail_fun) {
	my_loading_show();
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		dataType: "jsonp",
		success: function (data) {
			my_loading_hide();
			succ_fun && succ_fun(data);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			my_loading_hide();
			if (fail_fun) {
				fail_fun(XMLHttpRequest, textStatus, errorThrown);
			} else {
				my_alert('网络异常');
			}
		}
	});
}
function ajax_json(url, data, succ_fun, fail_fun) {
	my_loading_show();
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		dataType: "json",
		success: function (data) {
			my_loading_hide();
			succ_fun && succ_fun(data);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			my_loading_hide();
			if (fail_fun) {
				fail_fun(XMLHttpRequest, textStatus, errorThrown);
			} else {
				my_alert('网络异常');
			}
		}
	});
}
function ajax_json2(url, data, succ_fun, fail_fun) {
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		dataType: "json",
		success: function (data) {
			succ_fun && succ_fun(data);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			if (fail_fun) {
				fail_fun(XMLHttpRequest, textStatus, errorThrown);
			} else {
				my_alert('网络异常');
			}
		}
	});
}

/**
设置列表批量选择框
*/
function set_select_all(id, bat_name, parentid) {
	$(id).change(function () {
		var _this = this;
		$(parentid ? $(parentid) : document).find('input[name="' + bat_name + '"]').each(function () {
			this.checked = _this.checked;
			if (this.checked) {
				$(this).attr('checked', 'checked');
				$(this).prop("checked");
			} else {
				$(this).removeAttr('checked');
				$(this).removeProp("checked");
			}

			$(this).trigger('nf_change');
		})
	});
	$(parentid ? $(parentid) : document).on('change', 'input[name="' + bat_name + '"]', function () {
		var _this = this;
		var bat_list = $(parentid ? $(parentid) : document).find('input[name="' + bat_name + '"]');
		///console.log($('.list_table').html())
		//console.log(bat_list.filter('[checked]').length+","+bat_list.length)
		if (bat_list.filter('[checked]').length == bat_list.length) {
			$(id).get(0).checked = true;
			$(id).trigger('nf_change');
		} else {
			$(id).get(0).checked = false;
			$(id).trigger('nf_change');
		}
	});
}
// 格式化文件大小单位
function formatSize(size) {
	var result = toInt(size);
	if (result < 1024) {
		return result + "B";
	} else if (result < 1024 * 1024) {
		return parseInt(result / 1024) + "KB";
	} else if (result < 1024 * 1024 * 1024) {
		return parseInt(result / (1024 * 1024)) + "MB";
	} else {
		return parseInt(result / (1024 * 1024 * 1024)) + "GB";
	}
}
