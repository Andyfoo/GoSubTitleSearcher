//alert(navigator.userAgent);
$(function(){
	$(window).resize(function(){
		
		var win_w = $(window).width();
		var win_h = $(window).height();
		$('#list_body').height(win_h - $('#search_box').height() - $('#list_footer').height());
		
		var extract_dialog = $('#extract_dialog');
		var box = extract_dialog.find('.box');
		box.css({
			'margin-left':(0-box.width()/2)+'px'
		});
		$('#search_box .filename_border').width($('#search_box').width() - 180);
		//$('#search_box .filename').width($('#search_box').width() - 190);
		filenameChange();

	}).resize();



	$('#search_from').newforms();
	$('#batch_from').newforms();

	set_select_all('#select_all', 'item_id', '#list_body');
	
	

	$('#search_box .filename').contextmenu(function (e) {
		var input = $('#search_box .filename');
		var input_text=input.attr('val').trim();

		var sel_text = window.getSelection().toString();
		var menu=[
			[
				'选择文件',
				function (dom) {
					$('#btn_sel_file').click();					
				}
			]
		];
		
		if(input_text){
			menu.push('|');
			menu.push([
				'打开文件夹',
				function (dom) {
					ajax_json('/api/mainwin/open_path',{
						
					}, function (resp){
						
						if(resp.result > 0){
							my_alert(resp.message);
							return;
						}

						
					});					
				}
			]);
			menu.push('|');
			input_text_tip = input_text;
			if(input_text.length > 80){
				input_text_tip = input_text.substring(0,80);
			}
			menu.push([
				'复制文字：'+input_text_tip,
				function (dom) {
					copy_clipboard(input_text);
				}
			]);
		}
		if(sel_text && input_text != sel_text){
			sel_text = sel_text.trim();
			sel_text_tip = sel_text;
			if(sel_text.length > 80){
				sel_text_tip = sel_text.substring(0,80);
			}
			menu.push([
				'复制选中：'+sel_text_tip,
				function (dom) {
					copy_clipboard(sel_text);
				}
			]);
		}
                ContextMenu.render(e,menu,this); //开始渲染
        });
	$('#list_body table').contextmenu(function (e) {
		var sel_text = window.getSelection().toString();
		var menu=[
			[
				'下载字幕',
				function (dom) {
					down_last_tr_zimu();
				}
			],
			'|',
			[
				'下载字幕(UTF-8 繁转简)',
				function (dom) {
					down_last_tr_zimu('UTF-8');
				}
			],
			[
				'下载字幕(GBK 繁转简)',
				function (dom) {
					down_last_tr_zimu('GBK');
				}
			],
			[
				'下载字幕(Big5 繁转简)',
				function (dom) {
					down_last_tr_zimu('Big5');
				}
			]
		];
		if(typeof(last_list_table_tr) == 'undefined' || last_list_table_tr.find('.download[url]').length>0){
			menu = [];
		}
		var title;
		if(typeof(last_list_table_tr) != 'undefined' && last_list_table_tr.length > 0){
			title = last_list_table_tr.find('.title').text();
			if(title){
				title = title.trim();
				var title_tip = title;
				if(title.length > 80){
					title_tip = title.substring(0,80);
				}
				menu.push('|');
				menu.push([
					'复制文字：'+title_tip,
					function (dom) {
						copy_clipboard(title);
					}
				]);
			}
		}
		if(sel_text){
			sel_text = sel_text.trim();
			var sel_text_tip = sel_text;
			if(sel_text.length > 80){
				sel_text_tip = sel_text.substring(0,80);
			}
			if(title!=sel_text){
				menu.push([
					'复制选中：'+sel_text_tip,
					function (dom) {
						copy_clipboard(sel_text);
					}
				]);
			}
		}
		if(menu.length==0){
			return;
		}
                ContextMenu.render(e,menu,this); //开始渲染
        });
	$('#list_body').on('mouseenter','tr',function(){
		window.last_list_table_tr = $(this);
	});
	$('#list_body').on('click','.download',function(){
		var tr = $(this).parents('tr');
		if($(this).attr('url')){
			ajax_jsonp('/api/open_url',{
				url : $(this).attr('url')
			}, function (data){
				
				
			}, function(XMLHttpRequest, textStatus, errorThrown){
				console.log(XMLHttpRequest, textStatus, errorThrown);
			});
			return;
		}
		down_zimu(tr.find('input[name="item_id"]').val(), tr.find('select[name="item_simplified_charset"]').val());
	});
	
	$('#btn_about').on('click', function(event){
		event.preventDefault();
		ajax_json('/app_info',{
			
		}, function (resp){
			if(resp.result > 0){
				my_alert(resp.message);
				return;
			}
			$('#about_box .app_name').html(resp.data.appName);
			$('#about_box .app_ver').html(resp.data.appVer);
			$('#about_box .app_pub_date').html(resp.data.appPubDate);
			$('#about_box').show();
			
		});
		
	});
	$('#about_box,#about_box .close').on('click', function(event){
		event.preventDefault();
		if($(event.target).hasClass('dialog') || !$(event.target).hasClass('close')&&$(event.target).parents('.dialog').length>0){
			return;
		}
		$('#about_box').hide();
	});


	$('#simplified_select_all').change(function(){
		var checkbox = this;
		$('#list_body').find('select[name="item_simplified_charset"]').each(function(){
			if($(this).val() == '' && checkbox.checked){
				$(this).val('UTF-8');
				$(this).trigger('nf_change');
			}else if(!checkbox.checked){
				$(this).val('');
				$(this).trigger('nf_change');
			}
		});
	});
	$('#btn_sel_file').on('click', function(){
		ajax_json('/api/mainwin/sel_file',{
			
		}, function (resp){
			if(resp.result == 2){
				return;
			}
			if(resp.result > 0){
				my_alert(resp.message);
				return;
			}

			var data = resp.data;
			if(data && data.filename){
				$('#search_box .filename').attr('val',data.filename);
				$('#search_box .filename').html(data.filename);
				filenameChange();
				search_start();
			}
			
		});
	});
	$('#btn_search').on('click', function(){
		var _this = this;
		search_start(true);
	});
	$('#btn_download').on('click', function(){
		var _this = this;
		
		var isSelect = [];
		
		var item_simplified_charset = $('select[name="item_simplified_charset"]');
		var item_ids = $('input[type="checkbox"][name="item_id"]');
		if(item_ids.length == 0){
			my_alert('请选择字幕');
			return;
		}
		var searchDatas = [];
		item_ids.each(function(index){
			var charset = item_simplified_charset.eq(index).val();
			
			if(this.checked){
				var index = toInt(this.value);
				searchDatas.push({
					index : index,
					downParm : {
						filenameType:1,
						simplified:charset.length>0,
						charset:charset
					}
				});
			}
		});
		//var success_count = 0;
		//var fail_count = 0;
		//var finish_count = 0;
		my_loading_show();
		function down(){
			
			if(searchDatas.length == 0){
				my_loading_hide();
				my_tip('下载完成');
				return;
			}
			var searchData = searchDatas.pop();
			ajax_json2('/api/mainwin/down',{
				data : json_encode(searchData)
			}, function (resp){
				if(resp.result == 2){
					show_extract_dialog(resp.data, function(){
						down();
					});
					return;
				}
				if(resp.result > 0){
					my_tip(resp.message);
					down();
					return;
				}
				down();
			}, function(){
				down();
			});
		}
		down();
		
	});
	
	
	laytpl_preload('#rec_list_tpl');
	init_data();
	

	window.ext_finish_callback = null;
	window.ext_data = {};
	$('#extract_dialog .close').on('click', function(){
		$('#extract_dialog').hide();
		ext_finish_callback&&ext_finish_callback();
	});

	
});

function show_extract_dialog(data, finish_callback){
	window.ext_data = data;
	window.ext_finish_callback = finish_callback;
	$('#extract_dialog').show();
	$(window).resize();
	window.extract_dialog_iframe.location.reload();
}

//下载鼠标最后移动到的字幕
function down_last_tr_zimu(charset){
	if(typeof(last_list_table_tr) == 'undefined' || last_list_table_tr.length == 0){
		my_alert('数据错误');
		return;
	}
	down_zimu(last_list_table_tr.find('input[name="item_id"]').val(), charset);
}


//下载指定字幕
function down_zimu(index, charset){
	if(!charset){
		charset = $('#list_body').find('select[name="item_simplified_charset"]').eq(index).val();
	}
	var searchData = {
		index : toInt(index),
		downParm : {
			filenameType:0,
			simplified:charset.length>0,
			charset:charset
		}
	};
	ajax_json('/api/mainwin/down',{
		data : json_encode(searchData)
	}, function (resp){
		if(resp.result == 2){
			show_extract_dialog(resp.data, function(){
				
			});
			return;
		}
		if(resp.result > 0){
			my_alert(resp.message);
			return;
		}
		my_tip('下载完成');
	});
}

 
//开始搜索 
function search_start(is_click){
	if($('#search_box .filename').attr('val').length == 0){
		if(is_click){
			my_alert('请选择视频文件');
		}
		return;
	}
	
	var searchParm = {};
	var form_count = 0;
	$('#search_box input[name="froms"]').each(function(){
		var val = $(this).attr('value');
		searchParm['from_'+val] = this.checked;
		if(this.checked){
			form_count++;
		}
	});
	if(form_count == 0){
		my_loading_hide();
		if(is_click){
			my_alert('请选择至少1个字幕数据源');
		}
		return;
	}
	
	var searchData = {
		searchParm : searchParm
	};
	var time1 = (new Date()).getTime();
	ajax_json('/api/mainwin/search_list',{
		data : json_encode(searchData)
	}, function (resp){
		if(resp.result > 0){
			my_alert(resp.message);
			return;
		}
		if(!resp.data){
			my_alert('未搜索到结果');
			return;
		}

		var data = {
			list : resp.data
		};
		var useTime = (((new Date()).getTime() - time1)/1000).toFixed(2);
		$('#status_label').html('查询到'+data.list.length+'个字幕数据，共耗时：'+(useTime)+'秒');
		$('#rec_list').empty();
		laytpl_render('#rec_list_tpl', data, function(html){
			$('#rec_list').append(html);
			$('#batch_from').newforms();
		});
	});
	
	//var dataStr = app.searchList(json_encode(searchData));


	
}
function init_data(){
	ajax_json('/api/mainwin/init',{
	}, function (resp){
		if(resp.result > 0){
			my_alert(resp.message);
			return;
		}
		var data = resp.data;
		if(data.searchParm){
			var froms = ["sheshou", "xunlei", "zimuku", "subhd"];
			for(var i in froms){
				if(data.searchParm['from_'+froms[i]]){
					$('#search_box input[name="froms"][value="'+froms[i]+'"]')[0].checked = true;
					$('#search_box input[name="froms"][value="'+froms[i]+'"]').trigger('nf_change');
				}
			}
		}
		if(data.movFileInfo && data.movFileInfo.filename){
			$('#search_box .filename').attr('val', data.movFileInfo.filename);
			$('#search_box .filename').html(data.movFileInfo.filename);
			filenameChange();
			search_start();
		}
		monitor_data();
	}, function (){
		my_alert('初始化数据失败');
	});
	
}
function filenameChange(){
     $('#search_box .filename').scrollLeft($('#search_box .filename').prop("scrollWidth"),200);
}

function monitor_data(){
	var wSock = new XWebSocket('ws://'+window.location.host+'/api/ws',{
		retry : true,//断开重连
		retry_timeout : 5000,//断开重连时间
		onopen : function (from, evt){
			log("onopen",evt);
			//wSock.send('333');
		},
		onerror : function (from, evt){
			log("onerror",evt);
		},
		onmessage : function (from, evt){
			log("onmessage",evt.data);
			var json = json_decode(evt.data);
			if(json&&json.cmd){
				switch(json.cmd){
					case 'mov_file_change':
						var data = json.data;
						if(data && data.filename && data.filename != $('#search_box .filename').attr('val')){
							$('#search_box .filename').attr('val',data.filename);
							$('#search_box .filename').html(data.filename);
							filenameChange();
							search_start();
						}
						break;
					case 'autocheck_version':
						autocheck_version();
						break;
				}
			}
		},
		onclose : function (from, evt){
			log("onclose",evt);
		},
		ontimeout : function (from, evt){
			log("timeout",evt);
		}
	});
	wSock.open();
	
}


function autocheck_version(){
	ajax_json('/api/check_version',{
	}, function (resp){
		if(resp.result > 0){
			//my_alert(resp.message);
			return;
		}
		my_alert("发现新版本：v{0}，点击开始升级！<pre style=\"color:red;line-height:150%;font-size:12px;\">\n{1}</pre>".format(resp.data.version, resp.data.desc.replace("\n","<br>").replace("\\n","<br>")), function(){
			upgrade_version();
		});
	}, function (){
		
	});
	
}
function upgrade_version(){
	ajax_json('/api/upgrade_version',{
	}, function (resp){
		if(resp.result > 0){
			my_alert(resp.message);
			return;
		}
		my_alert("更新成功");
	}, function (){
		my_alert("更新失败");
	});
}