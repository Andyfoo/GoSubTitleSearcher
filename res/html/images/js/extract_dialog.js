$(function(){
	laytpl_preload('#rec_list_tpl');
	if(!init_dialog()){
		return;
	}


	$(window).resize(function(){
		$('#list_body').height($(window).height() - $('#search_box').height() - $('#list_footer').height());
	}).resize();
	$('#batch_from').newforms();


	set_select_all('#select_all', 'item_id', '#list_body');

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
						app.copyClipboard(title);
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
						app.copyClipboard(sel_text);
					}
				]);
			}
		}
                ContextMenu.render(e,menu,this); //开始渲染
        });

	$('#list_body').on('mouseenter','tr',function(){
		window.last_list_table_tr = $(this);
	});
	$('#list_body').on('click','.download',function(){
		var tr = $(this).parents('tr');
		down_zimu(tr.find('input[name="item_id"]').val(), tr.find('select[name="item_simplified_charset"]').val());
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

	$('#btn_download').on('click', function(){
		
		var items_ids = [];
		
		var item_simplified_charset = $('#list_body').find('select[name="item_simplified_charset"]');
		$('#list_body').find('input[type="checkbox"][name="item_id"]').each(function(index){
			var charset = item_simplified_charset.eq(index).val();
			var title = $('#list_body').find('.list_table .title').eq(index).attr('val');
			if(this.checked){
				items_ids.push({
					Filename:title,
					downParm:{
						filenameType:1,
						simplified:charset.length>0,
						charset:charset
					}
				});
			}
		});
		if(items_ids.length == 0){
			btn.disabled = false;
			my_alert('请选择字幕');
			return;
		}

		var searchData = {
			archiveKey : ext_data.archiveKey,
			items : items_ids
		};
		ajax_json('/api/mainwin/down_archive',{
			data : json_encode(searchData)
		}, function (data){
			if(data.result > 0){
				my_alert(data.message);
				return;
			}
			my_tip('下载完成');
			
		});
	});




	/*show_extract_dialog({
		archiveKey : 'asdfzsdfds',
		archiveFilename : 'aaaa.zip',
		archiveSize : 1000,
		archiveExt : 'zip',
		archiveFilelist :[
			{
				filename:"aaa.srt",
				size:1000,
				ext:"srt",
				time:"2018-12-12 11:00:00",
			},
			{
				filename:"aaa.srt",
				size:1000,
				ext:"srt",
				time:"2018-12-12 11:00:00",
			},
			{
				filename:"aaa.srt",
				size:1000,
				ext:"srt",
				time:"2018-12-12 11:00:00",
			}
		]
	});*/
});
function init_dialog(){
	window.ext_data = parent.ext_data;
	if(ext_data == null || !ext_data || !ext_data.archiveKey)return false;
	$('#rec_list').empty();
	$('#search_box .con').html(ext_data.archiveFilename + '<span class="light">('+ext_data.archiveExt+', '+formatSize(ext_data.archiveSize)+')</span>');
	$('#extract_dialog').show();
	$(window).resize();
	laytpl_render('#rec_list_tpl', {
		list:ext_data.archiveFilelist
	}, function(html){
		$('#rec_list').append(html);
		$('#batch_from').newforms();
	});
	return true;
	
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
	var title = $('#list_body').find('.list_table .title').eq(index).attr('val');
	var searchData = {
		archiveKey : ext_data.archiveKey,
		items:[
			{
				Filename:title,
				downParm : {
					filenameType:0,
					simplified:charset.length>0,
					charset:charset
				}
			}	
		]
	};
	ajax_json('/api/mainwin/down_archive',{
		data : json_encode(searchData)
	}, function (resp){
		if(resp.result > 0){
			my_alert(resp.message);
			return;
		}
		my_tip('下载完成');
	});
}
