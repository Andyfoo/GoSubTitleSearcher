/*
 美化表单
 Author:Andyfoo
 http://www.andyfoo.com
 http://www.pslib.com
 varsion:1.01
 date:2015-01-18
*/

(function($) {
	var newForms_ua = (navigator.userAgent + "").toLowerCase();
	
	var browser_ie = (/(msie\s|trident.*rv:)([\w.]+)/).exec(newForms_ua.toLowerCase())!=null;
	var browser_ie6 = newForms_ua.indexOf('msie 4.') > 0 || newForms_ua.indexOf('msie 5.') > 0 || newForms_ua.indexOf('msie 6.') > 0;
	
	var browser_firefox = newForms_ua.indexOf('firefox') > -1;
	var browser_chrome = newForms_ua.indexOf('chrome') > -1;
	var NewForms_count = 0;

	var NewForms_id_buffer = new Array();
	var NewForms_id_events = new Array();

	function log(str) {
		window.console && console.log('log: ' + str);

	}


	$.NewForms = function(elm, options) {
		var base = this;
		this.$elm = $(elm);
		this.form = null;
		this.opts = $.extend({}, $.fn.newforms.defaults, options);

		this.mouseTimer = null;

		this.id_buffer_key = this.$elm.attr("newforms_id_buffer");
		if (this.id_buffer_key == null || this.id_buffer_key.length == 0) {
			this.id_buffer_key = this.getCount();
			NewForms_id_buffer[this.id_buffer_key] = new Array();
		} else {
			if (!NewForms_id_buffer[this.id_buffer_key]) {
				NewForms_id_buffer[this.id_buffer_key] = new Array();
			}
		}
		this.$elm.attr("newforms_id_buffer", this.id_buffer_key);

		this.init();
	};
	$.NewForms.prototype = {
		init : function() {
			this.$elm.addClass("newforms");
			if (this.$elm.length > 0 && this.$elm[0].tagName.toLowerCase() == 'form') {
				this.form = this.$elm;
			} else if (this.$elm.find("form").length > 0) {
				this.form = this.$elm.find("form");
			} else {
				return;
			}
			this.form.attr("autocomplete", "off");
			this.form.find("input[type=button],input[type=submit],input[type=reset],input[type=image],a[class=newforms_link],a[class=newforms_link_sel]").attr("hidefocus", "true").bind("focus", function() {
				this.blur();
			});

			this.replace_input_text();
			this.replace_textarea();

			this.replace_file();
			this.replace_checkbox();
			this.replace_radio();

			this.replace_select();
			this.replace_select_multiple();

			this.replace_button();

			this.replace_button_image();

			this.replace_link();
		},
		replace_input_text : function() {
			var inputs = this.$elm.find("input[type=text],input[type=password]");
			var _this = this;
			inputs.each(function(i) {
				var input = $(this);

				var is_init = input.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				input.attr("newforms_is_init", "1");

				if (input.attr("disabled") || input.attr("readonly")) {
					

				}

				if (input.attr("ntype") == "number") {
					var _max = input.attr("max");
					var max = _this.toInt(_max);
					var _min = input.attr("min");
					var min = _this.toInt(_min);
					var val = _this.toInt(input.val());
					if (!_this.isNull(_min) && val < min) {
						val = min;
						input.val(val);
					} else if (!_this.isNull(_max) && val > max) {
						val = max;
						input.val(val);
					}

					input.wrap('<div class="newforms_input_text"></div>').before('<a href="#" class="newforms_t"></a><a href="#" class="newforms_b"></a>');
					input.bind("focus", function() {
						if (input.attr("disabled") || input.attr("readonly"))
							return;

						this.style.imeMode = 'disabled';
						// 禁用输入法,禁止输入中文字符

						var div = $(this).parents(".newforms_input_text");
						div.addClass("newforms_input_text_focus");

					});

					input.bind("blur", function() {
						var div = $(this).parents(".newforms_input_text");
						div.removeClass("newforms_input_text_focus");

						var _max = input.attr("max");
						var max = _this.toInt(_max);
						var _min = input.attr("min");
						var min = _this.toInt(_min);

						var val = _this.toInt(input.val());
						if (!_this.isNull(_min) && val < min) {
							val = min;
							input.val(val);
						} else if (!_this.isNull(_max) && val > max) {
							val = max;
							input.val(val);
						}
					});

					input.bind("keypress", function(e) {
						var keyCode = e.keyCode ? e.keyCode : e.which;
						if ((keyCode > 47 && keyCode < 58) || keyCode == 8 || keyCode == 17 || keyCode == 45) {
							return true;
						}
						return false;
					});
					input.bind("keyup", function(e) {
						this.value=this.value.replace(/[^\d]+/g,'');
					});
					var div = input.parent();

					var add = div.find("a.newforms_t");
					var sub = div.find("a.newforms_b");
					
					if (input.attr("disabled") || input.attr("readonly")) {
						add.attr("disabled", true);
						sub.attr("disabled", true);
					}
					add.focus(function() {
						this.blur();
					}).click(function(event) {
						event.preventDefault();
					}).attr("hidefocus", "true");
					sub.focus(function() {
						this.blur();
					}).click(function(event) {
						event.preventDefault();
					}).attr("hidefocus", "true");

					var add_fun = function() {
						var _max = input.attr("max");
						var max = _this.toInt(_max);
						var _min = input.attr("min");
						var min = _this.toInt(_min);

						var _val = input.val();
						if (_this.isNull(_val))
							_val = _this.isNull(_min) ? 0 : min;
						var val = _this.toInt(_val);
						if (!_this.isNull(_min) && val < min) {
							val = min;
						} else if (!_this.isNull(_max) && val > max) {
							val = max;
						}
						input.val(val);
						val++;

						if (!_this.isNull(_max) && val <= max) {
							input.val(val);
						} else if (_this.isNull(_max)) {
							input.val(val);

						} else {
							_this.clearMouseTimer();
						}
						_this.setMouseTimer(add_fun, 100);
					};
					add.mousedown(function() {
						if (input.attr("disabled") || input.attr("readonly"))
							return;

						add_fun();
						_this.setMouseTimer(add_fun, 600);

					});
					add.mouseup(function() {
						if (input.attr("disabled") || input.attr("readonly"))
							return;

						input.focus();
						_this.clearMouseTimer();
					});
					add.mouseleave(function() {
						_this.clearMouseTimer();
					});
					var sub_fun = function() {
						var _max = input.attr("max");
						var max = _this.toInt(_max);
						var _min = input.attr("min");
						var min = _this.toInt(_min);

						var _val = input.val();
						if (_this.isNull(_val))
							_val = 1;
						var val = _this.toInt(_val);
						if (!_this.isNull(_min) && val < min) {
							val = min;
						} else if (!_this.isNull(_max) && val > max) {
							val = max;
						}
						input.val(val);
						val--;

						if (!_this.isNull(_min) && val >= min) {
							input.val(val);
						} else if (_this.isNull(_min)) {

							input.val(val);

						} else {
							_this.clearMouseTimer();
						}
						_this.setMouseTimer(sub_fun, 100);
					};
					sub.mousedown(function() {
						if (input.attr("disabled") || input.attr("readonly"))
							return;
						sub_fun();
						_this.setMouseTimer(sub_fun, 600);
					});

					sub.mouseup(function() {
						if (input.attr("disabled") || input.attr("readonly"))
							return;
						input.focus();
						_this.clearMouseTimer();
					});
					sub.mouseleave(function() {
						_this.clearMouseTimer();
					});

				} else if (input.attr("ntype") == "date") {
					//使用了My97 DatePicker  http://www.my97.net/
					//使用时请加载<script type="text/javascript" src="datepicker/WdatePicker.js"></script>
					var id = _this.getItemId();

					input.attr("readonly", true);

					//日期输入框设置 cale_config属性可以配置日历参数
					var cale_config = input.attr("cale_config");
					if (cale_config) {
						cale_config = $.parseJSON(cale_config);
					} else {
						cale_config = {};
					}
					cale_config.onpicked = function() {
						input.blur();
						input.change();
					}

					input.wrap('<div class="newforms_input_text" id="' + id + '"></div>').before('<a href="#" class="newforms_date"></a>');
					input.bind("focus", function() {
						if ($(this).attr("disabled")) {
							return;
						}
						this.style.imeMode = 'disabled';
						// 禁用输入法,禁止输入中文字符
						WdatePicker(cale_config);

					});
					

					input.bind("blur", function() {
						

					});

					var div = input.parent();
					var date = div.find("a");
					if (input.attr("disabled")) {
						date.attr("disabled", true);
					}
					
					date.focus(function() {
						this.blur();
					}).attr("hidefocus", "true");

					cale_config.id = input;
					cale_config.offsetX = 0;
					
					date.click(function(event) {
						event.preventDefault();
					});
					date.mouseup(function() {
						if (input.attr("disabled"))
							return;

						input.focus();

					});

				} else{
					input.wrap('<div class="newforms_input_text"></div>');
				}

			});

		},
		replace_textarea : function() {
			var textareas = this.$elm.find("textarea");
			var _this = this;
			textareas.each(function(i) {
				var textarea = $(this);

				var is_init = textarea.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				textarea.attr("newforms_is_init", "1");

				if (textarea.attr("disabled") || textarea.attr("readonly")) {
					textarea.addClass("newforms_textarea_disabled");

				}

				textarea.wrap('<div class="newforms_textarea"></div>');

				var div = textarea.parent();

				textarea.bind("focus", function() {
					if (textarea.attr("disabled") || textarea.attr("readonly"))
						return;


				});
				textarea.bind("blur", function() {
				});

			});

		},
		replace_file : function() {
			var inputs = this.$elm.find("input[type=file]");
			var _this = this;
			inputs.each(function(i) {
				var input = $(this);

				var is_init = input.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				input.attr("newforms_is_init", "1");

				var input_width = input.innerWidth();
				var size = input.attr("size");
				input.wrap('<div class="newforms_input_text"></div>').after('<a href="#" class="newforms_file">选择文件...</a>')
					.before('<input type="text" readonly  '+(size ? 'size="' + size + '"' : '' )+' style="width:' + input_width + 'px" />');
				if (browser_ie) {
					input.width(20);
					input.wrap('<div class="newforms_input_file" style="width:40px;height:25px;overflow:hidden;position: absolute;left:0px;top:0px;z-index:10;filter:alpha(opacity=0);opacity:0;"></div>');
				}else{
					input.wrap('<div class="newforms_input_file" style="width:0px;height:0px;overflow:hidden;"></div>');
				}
				var div = input.parent().parent();

				var input2 = div.children("input[type=text]");
				input2.attr("newforms_is_init", "1");

				var btn = div.find("a");
				btn.bind("focus", function() {
					this.blur();
				}).attr("hidefocus", "true");

				if (input.attr("disabled") || input.attr("readonly")) {
					input2.attr("disabled", "true");
					btn.attr("disabled", "true");
				}

				input.bind("change nf_change", function() {
					input2.val($(this).val());
					input2.focus();
				});
				input2.bind("click", function(event) {
					if (input.attr("disabled") || input.attr("readonly"))
						return;
					input.click();
				});
				btn.bind("click", function(event) {
					event.preventDefault();
					if (input.attr("disabled") || input.attr("readonly"))
						return;
					input.click();
				});
				btn.bind("blur", function() {
					input.blur();
				});

				input2.bind("focus", function() {

				});
				input2.bind("blur", function() {

					input.blur();

				});
				if(browser_ie) {
					div.css("overflow","hidden");
					var move_fun = function (e){
						var offset = div.offset();
						div.find(".newforms_input_file").css({left:(e.pageX - offset.left - 10)+"px", top:(e.pageY - offset.top - 10)+"px"});
					};
					div.bind("mouseover", function(e) {
						move_fun(e);
					});
					div.bind("mousemove", function(e) {
						move_fun(e);
					});
					
				}
			});

		},

		replace_button : function() {
			var inputs = this.$elm.find("input[type=button],input[type=submit],input[type=reset]");
			inputs.each(function(i) {
				var input = $(this);

				var is_init = input.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				input.attr("newforms_is_init", "1");

				input.addClass("newforms_button");

				input.attr("hidefocus", "true");
			});

		},

		replace_button_image : function() {
			var inputs = this.$elm.find("input[type=image]");
			inputs.each(function(i) {
				var input = $(this);

				var is_init = input.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				input.attr("newforms_is_init", "1");

				input.addClass("newforms_button_image");

				input.bind("focus", function() {
					this.blur();
				}).attr("hidefocus", "true");
			});

		},

		replace_checkbox : function() {
			var inputs = this.$elm.find("input[type=checkbox]");
			var _this = this;
			inputs.each(function(i) {
				var checkbox = $(inputs[i]);

				var is_init = checkbox.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				checkbox.attr("newforms_is_init", "1");

				if (browser_ie) {
					checkbox.width(0).height(0).css("padding", "0px").css("margin", "0px").css("overflow", "hidden");
				} else {
					checkbox.hide();
				}
				$(this).wrap('<a href="#" class="newforms_checkbox"></a>');

				var btn = $(this).parent();
				if (checkbox[0].checked) {
					btn.addClass("newforms_checkbox_select");
				}
				btn.attr("checkbox_checked", checkbox[0].checked);

				if (checkbox.attr("disabled")) {
					btn.attr("disabled", true);
				}
				btn.bind("click", function(event) {
					event.preventDefault();
					var checkbox = $(this).children();
					if (checkbox.attr("disabled"))
						return;
					
					if (checkbox[0].checked) {
						checkbox[0].checked=false;
						checkbox.removeAttr("checked");
						$(this).removeClass("newforms_checkbox_select");
					} else {
						checkbox[0].checked=true;
						checkbox.attr("checked", true);
						$(this).addClass("newforms_checkbox_select");
					}
					checkbox.change();
				});
				checkbox.bind("click", function(event) {
					event.stopPropagation();

				});

				checkbox.bind("change nf_change", function() {
					var btn = $(this).parent();
					if (this.checked) {
						btn.addClass("newforms_checkbox_select");
					} else {
						btn.removeClass("newforms_checkbox_select");
					}
				});
				_this.form.bind("reset", function() {
					inputs.each(function(i) {
						var checkbox = $(inputs[i]);
						var btn = checkbox.parent();

						if (btn.attr("checkbox_checked") && btn.attr("checkbox_checked")=="true") {
							btn.addClass("newforms_checkbox_select");
						} else {
							btn.removeClass("newforms_checkbox_select");
						}
					});
				});

				btn.bind("focus", function() {
					this.blur();
				}).attr("hidefocus", "true");

				$.fn.nf_checkbox = function(checked) {
					return this.each(function() {
						this.checked = checked;
						$(this).trigger('nf_change');
					});
				};
			});

		},

		replace_radio : function() {
			var inputs = this.$elm.find("input[type=radio]");
			var _this = this;
			inputs.each(function(i) {
				var radio = $(inputs[i]);

				var is_init = radio.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				radio.attr("newforms_is_init", "1");

				if (browser_ie) {
					radio.width(0).height(0).css("padding", "0px").css("margin", "0px").css("overflow", "hidden");
				} else {
					radio.hide();
				}

				var id = _this.getItemId();
				$(this).wrap('<a href="#" class="newforms_radio" _name="' + radio.attr("name") + '" _index="' + i + '"></a>');

				radio.attr("_index", i);

				var btn = $(this).parent();
				if (radio[0].checked) {
					btn.addClass("newforms_radio_select");
				}
				btn.attr("checkbox_checked", radio[0].checked);

				if (radio.attr("disabled")) {
					btn.attr("disabled", true);
				} 
				btn.bind("click", function(event) {
					event.preventDefault();
					var radio = $(this).children();
					if (radio.attr("disabled"))
						return;

					$("a[_name=" + $(this).attr("_name") + "]").each(function(i) {
						$(this).removeClass("newforms_radio_select");
						var radio = $(this).children();
						radio.removeAttr("checked");
						if (radio.attr("disabled")) {
							$(this).removeClass("newforms_radio_disabled_select");
							$(this).addClass("newforms_radio_disabled");
						}

					});
					radio[0].checked = true;
					radio.attr("checked", true);
					$(this).addClass("newforms_radio_select");

					radio.change();
				});
				radio.bind("click", function(event) {
					event.stopPropagation();

				});

				radio.bind("change nf_change", function() {
					var btn = $(this).parent();
					$("a[_name=" + btn.attr("_name") + "]").removeClass("newforms_radio_select");
					if (this.checked) {
						btn.addClass("newforms_radio_select");
					} else {
						btn.removeClass("newforms_radio_select");
					}
				});
				_this.form.bind("reset", function() {
					inputs.each(function(i) {
						var radio = $(inputs[i]);
						var btn = radio.parent();

						if (btn.attr("checkbox_checked") && btn.attr("checkbox_checked")=="true") {
							btn.addClass("newforms_radio_select");
						} else {
							btn.removeClass("newforms_radio_select");

						}
					});
				});

				btn.bind("focus", function() {
					this.blur();
				}).attr("hidefocus", "true");

				$.fn.nf_radio = function(checked) {
					return this.each(function() {
						this.checked = checked;
						$(this).trigger('nf_change');
					});
				};
			});

		},
		replace_select : function() {
			var selects = this.$elm.find("select").not("select[multiple=multiple]");
			_this = this;
			selects.each(function(i) {
				var select = $(this);

				var is_init = select.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				select.attr("newforms_is_init", "1");

				var select_width = select.outerWidth();//select.outerWidth()+_this.opts.input_text_space*2;
				var select_height = select.outerHeight();
				var id = _this.getItemId();
				select.wrap('<div></div>');
				select.parent().wrap('<div class="newforms_select"></div>').after('<ul></ul>').after('<a><span></span></a>');
				var div = select.parent().parent();
				//div.width(select_width+_this.opts.select_arrow_space);
				div.width(select_width);
				//div.height(select_height);

				select.hide();
				
				var sela = div.children("a");
				var selval = sela.children("span");
				if (select.attr("disabled")) {
					sela.attr("disabled", true);
				}
				selval.attr("default_index", select[0].selectedIndex);
				if (select[0].options.length > 0 && select[0].selectedIndex>=0) {
					selval.html(select[0].options[select[0].selectedIndex].text);
				}

				var ul = div.children("ul");
				//ul.width(sela.outerWidth(true)-(select.outerWidth(true)-select.width()));
				ul.width(select_width);
				var add_option = function() {
					ul.empty();
					for (var i = 0; i < select[0].options.length; i++) {
						ul.append('<li ' + (i == select[0].selectedIndex ? 'class="select"' : '') + '><a href="#" hidefocus="true" title="' + select[0].options[i].text + '" onfocus="this.blur();" _index=' + i + '>' + select[0].options[i].text + '</a></li>');
					}
					ul.find("a").bind("click", function(event) {
						event.preventDefault();
						ul.children("li").removeClass("select");
						$(this).parent("li").addClass("select");

						select[0].selectedIndex = $(this).attr("_index");

						selval.html(select[0].options[select[0].selectedIndex].text);

						ul.hide();

						$(select[0]).change();

					});

				};
				add_option();
				
				select.bind("re_init", function() {
					add_option();
				});

				select.bind("change nf_change", function() {
					var lis = ul.children("li");
					if (select[0].options.length != lis.length) {
						add_option();
					}
					lis.removeClass("select");
					ul.find("a[_index=" + select[0].selectedIndex + "]").parent("li").addClass("select");
					if (select[0].selectedIndex >= 0){
						var str = select[0].options[select[0].selectedIndex].text;
						selval.html(str);
						var w1 = selval.outerWidth(true);
						var w2 = sela.outerWidth(true)-28;
						var word_w = w1/_this.strlen(str);
						if(w1>w2){//计算长度，自动截取超长字符
							var word_n = (w1-w2)/word_w;
							selval.html(_this.cutStr(str, _this.strlen(str)-word_n));
							selval.attr("title", str);
						}
					}else{
						selval.html("");
					}
					


				});
				_this.form.bind("reset", function() {
					var lis = ul.children("li");
					lis.removeClass("select");
					var default_index = _this.toInt(selval.attr("default_index"));
					if (default_index >= 0 && default_index < select[0].options.length) {
						ul.find("a[_index=" + default_index + "]").parent("li").addClass("select");
						selval.html(select[0].options[default_index].text);
					}
				});

				var hide_all_fun = function(event) {
					$(".newforms_select>ul").hide();

				};
				sela.bind("click", function(event) {
					event.stopPropagation();
					if (select.attr("disabled"))
						return;
					$(".newforms_select>ul").not(ul).hide();
					if (ul.is(":visible")) {
						ul.hide();
						return;
					}
					

					var wh = $(window).outerHeight(true);
					var dt = $(window).scrollTop();
					var ul_h = ul.outerHeight(true);
					var div_h = $(this).outerHeight(true);
					var div_offset = $(this).offset();

					var div_offset_top = div_offset.top;

					var offset_bottom = select.attr('nf_offset_bottom');
					if(offset_bottom){
						div_offset_top = div_offset_top+_this.toInt(offset_bottom);
					}

					if (div_offset_top + ul_h + div_h > wh + dt) {
						ul.css("top", (0 - ul_h) + "px");
					} else {
						ul.css("top", (0 + div_h) + "px");
					}

					ul.css("left", "0px");

					ul.scrollTop(0);
					ul.show();
					var li_offset = (select[0].selectedIndex - 1) * ul.children("li").height();

					ul.scrollTop(li_offset);

				});

				$(document).bind("click", hide_all_fun);

			});

		},
		replace_select_multiple : function() {
			var selects = this.$elm.find("select[multiple=multiple]");
			var _this = this;
			selects.each(function(i) {
				var select = $(this);

				var is_init = select.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				select.attr("newforms_is_init", "1");

				var select_width = select.innerWidth(true);

				if (select.attr("disabled")) {
					select.addClass("newforms_select_multiple_disabled");
				}

				select.wrap('<div class="newforms_select_multiple"></div>');

				var div = select.parent();

				select.bind("focus", function() {
					
				});
				select.bind("blur", function() {
					
				});
			});

		},

		replace_link : function() {
			var alinks = this.$elm.find("a.newforms_link,a.newforms_link_sel");
			var _this = this;
			alinks.each(function(i) {
				var alink = $(this);

				var is_init = alink.attr("newforms_is_init");
				if (is_init == "1") {
					return;
				}
				alink.attr("newforms_is_init", "1");
				alink.bind("click", function(event) {
					event.preventDefault();
					
					if(alink.attr("group_link")){
						_this.$elm.find("a[group_link="+alink.attr("group_link")+"]").removeClass("newforms_link_sel").addClass("newforms_link");
						$(this).removeClass("newforms_link").addClass("newforms_link_sel");
					}else{
						if($(this).attr("class").indexOf("newforms_link_sel")>-1){
							$(this).removeClass("newforms_link_sel").addClass("newforms_link");
						}else{
							$(this).removeClass("newforms_link").addClass("newforms_link_sel");
						}	
					}
					
				});

			});

		},

		set_disable : function(name, status) {
			var items = this.$elm.find("*[name="+name+"]");
			items.each(function (){
				var obj = $(this);
				this.disabled=status;
				var tagname = (this.tagName+"").toLowerCase();
				if(tagname == "input"){
					if(obj.attr("ntype") == "date" || obj.attr("ntype") == "number" || obj.attr("ntype") == "box" || obj.attr("ntype") == "ztree"){
						var div = obj.parent();
						var btn = div.find("a");
						btn.attr("disabled", status);
					}else if(obj.attr("type") == "file"){
						var div = obj.parent().parent();
						var input2 = div.children("input[type=text]");
						input2.attr("disabled", status);

						var btn = div.find("a");
						btn.attr("disabled", status);
					}else if(obj.attr("type") == "checkbox" || obj.attr("type") == "radio"){
						var id = obj.attr("_id");
						var btn = $("#" + id);
						
						btn.attr("disabled", status);
					}

				}else if(tagname == "select"){
					var div = obj.parent().parent();
					var sela = div.children("a");
					sela.attr("disabled", status);
				}
			});
		},
		set_readonly : function(name, status) {
			var items = this.$elm.find("*[name="+name+"]");
			items.each(function (){
				var obj = $(this);
				obj.attr("readonly", status);
				var tagname = (this.tagName+"").toLowerCase();
				if(tagname == "input"){
					if(obj.attr("ntype") == "date" || obj.attr("ntype") == "number" || obj.attr("ntype") == "box" || obj.attr("ntype") == "ztree"){
						var div = obj.parent();
						var btn = div.find("a");
						btn.attr("disabled", status);
					}else if(obj.attr("type") == "file"){
						var div = obj.parent().parent();
						var input2 = div.children("input[type=text]");
						input2.attr("disabled", status);

						var btn = div.find("a");
						btn.attr("disabled", status);
					}else if(obj.attr("type") == "checkbox" || obj.attr("type") == "radio"){
						var id = obj.attr("_id");
						var btn = $("#" + id);
						
						btn.attr("disabled", status);
					}

				}else if(tagname == "select"){
					var div = obj.parent().parent();
					var sela = div.children("a");
					sela.attr("disabled", status);
				}
			});
		},
		getItemId : function() {
			var n = "newforms_frm_item_" + this.getCount();

			NewForms_id_buffer[this.id_buffer_key].push(n);
			return n;

		},
		getCount : function() {
			return NewForms_count++;

		},
		addIdEvent : function(id, evt) {
			NewForms_id_events[id] = evt;
		},
		toInt : function(str) {
			var result = parseInt(str, 10);
			return isNaN(result) ? 0 : result;
		},
		isNull : function(str) {
			return str == null || str == "" || typeof (str) == "undefined";
		},
		strlen : function(str) {
			return str.replace(/[^\x00-\xff]/g, "**").length;
		},
		cutStr : function(ostr, n) {
			var r = /[^\x00-\xff]/g;
			
			if (ostr.replace(r, "**").length <= n) return ostr;
			var new_str = "";
			var str = "";
			for (var i=0,j = 0; i<ostr.length && j < n ; i++) {
				str = ostr.substr(i, 1);
				new_str+=str;
				j += (str.replace(r,"**").length > 1) ? 2 : 1;
			}
			return new_str + " ..";
		},
		setMouseTimer : function(fn, t) {
			if (this.mouseTimer != null) {
				window.clearTimeout(this.mouseTimer);
			}
			this.mouseTimer = window.setTimeout(fn, t);
		},
		clearMouseTimer : function(fn) {
			if (this.mouseTimer != null) {
				window.clearTimeout(this.mouseTimer);
			}
			this.mouseTimer = null;
		}
	};
	
	var newforms_buffer = new Array();
	$.fn.newforms = function(options) {
		var opts = $.extend({}, $.fn.newforms.defaults, options);

		return this.each(function() {
			newforms_buffer[this]=new $.NewForms(this, opts);
		});
	};

	$.fn.newforms_clear = function() {
		var k = $(this).attr("newforms_id_buffer");
		var arr = NewForms_id_buffer[k];
		if (!arr) {
			return;
		}
		for (var i in arr) {
			$("#" + arr[i]).remove();
			if (NewForms_id_events[arr[i]]) {
				$(document).unbind("click", NewForms_id_events[arr[i]]);
				NewForms_id_events[arr[i]] = null;
			}
		}
		NewForms_id_buffer[k] = null;
		arr = new Array();
		for (var i in NewForms_id_buffer) {
			if (NewForms_id_buffer[i] == null)
				continue;
			arr[i] = NewForms_id_buffer[i];
		}
		NewForms_id_buffer = arr;

		arr = new Array();
		for (var i in NewForms_id_events) {
			if (NewForms_id_events[i] == null)
				continue;
			arr[i] = NewForms_id_events[i];
		}
		NewForms_id_events = arr;

	};
	$.fn.get_newforms = function() {
		var r_array = new Array();
		this.each(function() {
			if(newforms_buffer[this]){
				r_array.push(newforms_buffer[this]);
			}
		});
		return r_array.length == 1 ? r_array[0] : r_array;
	};

	// default settings
	$.fn.newforms.defaults = {
		
	};
	/*$.fn.newforms.defaults = {
		input_text_space : 0,
		select_arrow_space : 15
	};*/
})(jQuery);

