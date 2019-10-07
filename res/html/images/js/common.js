
//自定义confirm
function my_confirm(msg,fun1,fun2){
	window.top.layer.confirm(msg, function (index){
		window.top.layer.close(index);
		fun1&&fun1();
	}, function (index){
		window.top.layer.close(index);
		fun2&&fun2();
	});

}
//自定义alert
function my_alert(msg,fun1){
	window.top.layer.alert(msg, function (index){
		window.top.layer.close(index);
		fun1&&fun1();
	});
}
//自定义prompt
function my_prompt(msg,fun1){
	window.top.layer.prompt({
		title: msg,
		formType: 0
	}, function (data, index){
		window.top.layer.close(index);
		fun1&&fun1(data);
	});
}

//自定义tip
function my_tip(msg,callback){
	layer.msg(msg, {
		time: 2000, 
		shadeClose: true,
		shade:[0.1, '#000']
	}, function(){
		callback&&callback();
	});
}

//my_loading
var my_loading_index = null;
function my_loading_show(){
	if(my_loading_index != null)return;
	my_loading_index = layer.load(0, {shade:[0.1, '#000'],zIndex: 1000});
}
function my_loading_hide(){
	if(my_loading_index != null)layer.close(my_loading_index);
	my_loading_index = null;
}

//my_win_open
function my_win_open(title, url, w, h){
	window.my_open_index = layer.open({
			type: 2,
			anim:0,
			title: title,
			shadeClose: false,
			area: [w+'px', h+'px'],
			content: url
		});
}

function my_win_close(){
	if(window.my_open_index){
		layer.close(window.my_open_index); 
	}
}


//是否为空
function isNull(str){
	return typeof(str) == 'undefined' || str == null;
}

function trim(value) {
	var temp = value;
	var obj = /^(\s*)([\W\w]*)(\b\s*$)/;
	if (obj.test(temp)) {
		temp = temp.replace(obj, '$2'); 
	}
	obj = /^(\s*)$/;
	if (obj.test(temp)) {
		temp = ''; 
	}

	return temp;
}
//格式化数字
function format_number(num, dot, dec_point){
	try{
		num = parseFloat(num);
		if(typeof(dot) == 'undefined')var dot=2;
		if(typeof(dec_point) == 'undefined')var dec_point='';
		num = num.toFixed(dot);
		if(dec_point.length>0){
			var   re=/(\d+)(\d{3})/,s=num.toString();  
			while(re.test(s))s=s.replace(re,"$1" + dec_point + "$2");  
			return s;  
		}
	}catch(e){
		
	}
	if(isNaN(num))num = "";
	return num;  
}
 
//字符串填充
function str_pad(t, len, fill){
	t = t+"";
	for(var i = t.length; i < len; i++){
		t = fill+t;
	}
	return t;
}

//转换为整数
function toInt(str){
	var result = parseInt(str, 10);
	return isNaN(result) ? 0 : result;
}



//是否为数字
function isNum(num){
	var rule = /^\d+$/; 
	if(rule.test(num))return true;
	return false;
}

 
//数组随机排序
function arrayRand(Arr){
	Arr.sort(function(){return Math.random()>0.5?-1:1;});
	return Arr;
}
//取min-max区间的随机数
function rand(min, max){
	var Range = max - min; 
	var Rand = Math.random(); 
	return(min + Math.round(Rand * Range)); 
}
//判断是字符串是否在数组中存在
function inArray(v, arr){
	try{
		for(var i = 0; i < arr.length;i++){
			if(v == arr[i])return true;
		}
	}catch(e){}
	return false;
}
//判断是字符串是否在数组中存在
function searchArray(v, arr){
	try{
		for(var i = 0; i < arr.length;i++){
			var str = arr[i] + "";
			if(str.indexOf(v) != -1)return new Array(i, arr[i]);
		}
	}catch(e){}
	return false;
}

//删除数组中的一个元素
function arrayDeleteItem(v, arr){
	var new_arr = new Array();
	try{
		for(var i = 0; i < arr.length;i++){
			if(v != arr[i]){new_arr[new_arr.length] = arr[i]}
		}
	}catch(e){}
	return new_arr;
}
//取数组最大数
function arrayMaxNum(a){
	var arr = new Array();
	arr = arr.concat(a);
	arr = arr.sort(function(a, b){
		a = parseInt(a, 10);b = parseInt(b, 10);
		if(a<b)return -1;
		if(a==b)return 0;
		if(a>b)return 1;
	});
	arr = arr.reverse();
	return arr[0];
}

/**
 * 统计字符串长度，中文2的长度
 * @returns
 */
String.prototype.len = function() {
    return this.replace(/[^\x00-\xff]/g, "**").length;
};
/**
 * 字符串截取
 * @param len
 * @returns
 */
String.prototype.cutStr = function(n) {
	var r = /[^\x00-\xff]/g;
	
	if (this.replace(r, "**").length <= n) return this;
	var new_str = "";
	var str = "";
	for (var i=0,j = 0; i<this.length && j < n ; i++) {
		str = this.substr(i, 1);
		new_str+=str;
		j += (str.replace(r,"**").length > 1) ? 2 : 1;
	}
	return new_str + " ..";
};

/**
 * 替换字符串中的字符
 * @param str
 * @param replace_what
 * @param replace_with
 * @returns
 */
function str_replace(str, replace_what, replace_with) {
	var ndx = str.indexOf(replace_what);
	var delta = replace_with.length - replace_what.length;
	while (ndx >= 0) {
		str = str.substring(0, ndx) + replace_with + str.substring(ndx + replace_what.length);
		ndx = str.indexOf(replace_what, ndx + delta + 1);
	}
	return str;
}



//取get变量的值 var info = getParameter("info");
function getParameter( sProp ) {
	try {
		var str = document.location.search;
		str = unescape(str);
		var re = new RegExp( sProp + "=([^\&]*)", "i" );
		var a = re.exec( str );
		if ( a == null )
			return "";
		return a[1];
	} catch(e) {
		return "";
	}
};

// alert( readCookie("myCookie") );
function readCookie(name)
{
	var cookieValue = "";
	var search = name + "=";
	if(document.cookie.length > 0)
	{ 
		offset = document.cookie.indexOf(search);
		if (offset != -1)
		{ 
			offset += search.length;
			end = document.cookie.indexOf(";", offset);
			if (end == -1) end = document.cookie.length;
				cookieValue = unescape(document.cookie.substring(offset, end))
		}
	}
	return cookieValue;
}
//time=秒
function writeCookie(name, value, time)
{
	var expire = "";
	if(time != null)
	{//domain=.baidu.com
		expire = new Date((new Date()).getTime() + time * 1000);
		expire = "; expires=" + expire.toGMTString();
	}
	expire += "; path=/";
	
	document.cookie = name + "=" + escape(value) + expire;
}
//存储
function WebStorage(){
	this.useStorage = window.localStorage && true;
	this.get = function (key){
		var val = this.useStorage ? window.localStorage[key] : readCookie(key);
		if(typeof(val) == 'undefined' || val == null)return null;
		return decodeURIComponent(val);
	};
	this.set = function (key, val){
		val = encodeURIComponent(val);
		if(this.useStorage){
			window.localStorage[key] = val;
		}else{
			writeCookie(key, val, 864000);
		}
	};
	this.remove = function (key){
		if(this.useStorage){
			window.localStorage.removeItem(key);
		}else{
			writeCookie(key, '', 0);
		}
	};
};
window.webStorage = new WebStorage();

function getTime(){
	return (new Date()).getTime();
}

/**
 * 格式化时间, t=时间戳
 * @param type
 * @param t
 * @returns
 */
function get_date(type, t){
	if(t){ 
		var o = new Date(parseFloat(t) * 1000); 
	}else{
		var o = new Date();
	}
	var dd = new Array();
	dd['y'] = o.getYear();
	dd['Y'] = o.getFullYear();
	dd['n'] = (parseInt(o.getMonth())+1);
	dd['m'] = str_pad(dd['n'], 2, "0");
	dd['j'] = o.getDate();
	dd['d'] = str_pad(dd['j'], 2, "0");
	
	dd['g'] = o.getHours();//小时，12 小时格式，没有前导零 1 到 12 
	if(dd['g']>12)dd['g'] = dd['g'] - 12;
	dd['G'] = o.getHours() ;//小时，24 小时格式，没有前导零 0 到 23 
	dd['h'] = str_pad(dd['g'], 2, "0");//小时，12 小时格式，有前导零 01 到 12 
	dd['H'] = str_pad(dd['G'], 2, "0");//小时，24 小时格式，有前导零 00 到 23 

	dd['i'] = str_pad(o.getMinutes(), 2, "0");
	dd['s'] = str_pad(o.getSeconds(), 2, "0");
	dd['w'] = o.getDay();
	var x = new Array("星期日", "星期一", "星期二","星期三","星期四", "星期五","星期六");
	var w = new Array("周日", "周一", "周二","周三","周四", "周五","周六");

	dd['W'] = x[dd['w']];

	
	var date = dd['Y'] + '-' + dd['m'] + '-' + dd['d'];
	var time = dd['H'] + ':' + dd['i'] + ':' + dd['s'];
	var md = dd['m'] + '-' + dd['d'];
	switch(type){
		case 'date':
			return date;
		break;
		case 'm-d w':
			return  dd['m'] + '-' + dd['d'] +' '+ w[dd['w']];
		break;
		case 'w':
			return dd['W'];
		break;
		case 'time':
			return time;
		break;
		case '':
		case 'datetime':
			return date + ' ' + time;
		break;
		default:
			var str = "Y-m-d H:i:s";
			if(typeof(type) == "string")str = type;
			var arr = str.split("");
			str = "";
			for(var i in arr){
				str += dd[arr[i]] ? dd[arr[i]] : arr[i];
			}
			return str;
		break;
	}
}

function log(){
	if(typeof(console) != 'object')return;
	try{
		var argsArray = Array.prototype.slice.call(arguments);
		console.trace.apply(console, [].concat(get_date('time'), argsArray));
		
		//console.trace.apply(console, arguments);
	}catch(e){
		console.log('error', e);
	}
}

//=====解决js浮点运算bug<<<

//除法函数，用来得到精确的除法结果
//调用：accDiv(arg1,arg2)
//返回值：arg1除以arg2的精确结果
function accDiv(arg1, arg2) {
	var t1 = 0,
		t2 = 0,
		r1, r2;
	try {
		t1 = arg1.toString().split(".")[1].length
	} catch (e) {}
	try {
		t2 = arg2.toString().split(".")[1].length
	} catch (e) {}
	with(Math) {
		r1 = Number(arg1.toString().replace(".", ""))
		r2 = Number(arg2.toString().replace(".", ""))
		return (r1 / r2) * pow(10, t2 - t1);
	}
}
//给Number类型增加一个div方法，调用起来更加方便。
Number.prototype.div = function(arg) {
	return accDiv(this, arg);
}
//乘法函数，用来得到精确的乘法结果
//调用：accMul(arg1,arg2)
//返回值：arg1乘以arg2的精确结果
function accMul(arg1, arg2) {
	var m = 0,
		s1 = arg1.toString(),
		s2 = arg2.toString();
	try {
		m += s1.split(".")[1].length
	} catch (e) {}
	try {
		m += s2.split(".")[1].length
	} catch (e) {}
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

//给Number类型增加一个mul方法，调用起来更加方便。
Number.prototype.mul = function(arg) {
	return accMul(arg, this);
}

//加法函数，用来得到精确的加法结果
//调用：accAdd(arg1,arg2)
//返回值：arg1加上arg2的精确结果
function accAdd(arg1, arg2) {
	var r1, r2, m;
	try {
		r1 = arg1.toString().split(".")[1].length
	} catch (e) {
		r1 = 0
	}
	try {
		r2 = arg2.toString().split(".")[1].length
	} catch (e) {
		r2 = 0
	}
	m = Math.pow(10, Math.max(r1, r2))
	return (arg1 * m + arg2 * m) / m
}

//给Number类型增加一个add方法，调用起来更加方便。
Number.prototype.add = function(arg) {
	return accAdd(arg, this);
}

//减法函数，用来得到精确的减法结果
//调用：accSub(arg1,arg2)
//返回值：arg1减去arg2的精确结果
function accSub(arg1, arg2) {
	var r1, r2, m, n;
	try {
		r1 = arg1.toString().split(".")[1].length
	} catch (e) {
		r1 = 0
	}
	try {
		r2 = arg2.toString().split(".")[1].length
	} catch (e) {
		r2 = 0
	}
	m = Math.pow(10, Math.max(r1, r2));
	// last modify by deeka
	// 动态控制精度长度
	n = (r1 >= r2) ? r1 : r2;
	return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

//给Number类型增加一个add方法，调用起来更加方便。
Number.prototype.sub = function(arg) {
		return accSub(arg, this);
}
// =====解决js浮点运算bug>>>
/**
验证字符串规则

strValid("字符串", {
	rule:'正则表达式名称，也可直接设置成正则', rule:'number', rule:/^\d+$/, 
	lenMin:最小长度, 
	lenMax:最大长度, 
	blenMin:最小字节长度, 
	blenMax:最大字节长度, 
	rangeMin:范围最小值, 
	rangeMax:范围最大值
})
*/
function strValid(str, opt){
	if(!window.strValidRules){
		window.strValidRules = {
			'email' : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,    
			'number' : /^\d+$/,
			'url' : /^(http[s]?:\/\/.+)$/,
			'tel' : /^((\(\d{2,3}\))|(\d{3}[\-]{0,1}))?(\(0\d{2,3}\)|0\d{2,3}[\-]{0,1})?[1-9]\d{6,7}([\-]{0,1}\d{1,4})?$/,
			'mobile' : /^((\(\d{3}\))|(\d{3}\-))?(13|15|18)\d{9}$/,
			'domain' : /^([\w]+\.[\w]+[\w.]*)$/,
			
			'money' : /^\d+(\.\d+)?$/,
			'zip' : /^[0-9]{5,6}$/,
			'oicq' : /^[0-9]{4,12}$/,
			'int' : /^[-\+]?\d+$/,
			'double' : /^[-\+]?\d+(\.\d+)?$/,
			'english' : /^[\w\. ]+$/,
			'letter' : /^[A-Za-z]+$/,
			'upper_letter' : /^[A-Z]+$/,
			'lower_letter' : /^[a-z]+$/,

			'chinese' : /^[\u4E00-\u9FA5\uF900-\uFA2D]+$/,
			'username' : /^[a-z]\w{2,32}$/i,
			'username2' : /^[\w]{2,32}$/i,
			'nickname' : /^[\u4E00-\u9FA5\uF900-\uFA2D\w]{2,40}$/i,    
			'password' : /^[\w]+$/,
			'password2' : /^[\w\.,,'~!#@$%^&*()<>\-=:\?+|]+$/,
			'char' : /^[\w\-]+$/,
			'text_cn_en' : /^[\u4E00-\u9FA5\uF900-\uFA2D\w]*$/i,


			'idcard' : /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
			'bankcard' : /^\d+$/,
			
			'ip' : /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/
		};
		/**
		* 检验18位身份证号码（15位号码可以只检测生日是否正确即可）
		* @author wolfchen
		* @param cid 18为的身份证号码
		* @return Boolean 是否合法
		**/
		window.strValid_checkIdcard = function(cid){
			var arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];//加权因子
			var arrValid = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2];//校验码
			if((/^\d{17}\d|x$/i).test(cid)){
				var sum = 0, idx;
				for(var i = 0; i < cid.length - 1; i++){
					// 对前17位数字与权值乘积求和
					sum += parseInt(cid.substr(i, 1), 10) * arrExp[i];
				}
				// 计算模（固定算法）
				idx = sum % 11;
				// 检验第18为是否与校验码相等
				return arrValid[idx] == cid.substr(17, 1).toUpperCase();
			}else{
				return false;
			}
		}

	}
	var rule = window.strValidRules[opt.rule];
	if(!rule)rule=opt.rule;
	//长度为0，则不输入内容时返回正确
	if(typeof(opt.lenMin) == 'number' && opt.lenMin == 0 && str.length == 0 )return true;

	if(typeof(rule) == 'object' && !rule.test(str))return false;
	if(typeof(opt.lenMin) == 'number' && str.length < opt.lenMin )return false;
	if(typeof(opt.lenMax) == 'number' && str.length > opt.lenMax )return false;
	if(typeof(opt.blenMin) == 'number' && str.len < opt.blenMin )return false;
	if(typeof(opt.blenMax) == 'number' && str.len > opt.blenMax )return false;
	if(typeof(opt.rangeMin) == 'number' && parseFloat(str, 10) < opt.rangeMin )return false;
	if(typeof(opt.rangeMax) == 'number' && parseFloat(str, 10) > opt.rangeMax )return false;

	//身份证号特殊处理
	if(opt.rule == 'idcard'){
		return strValid_checkIdcard(str);
	}
	return true;
}
String.prototype.valid = function(opt) {
	return strValid(this,opt);
};


;
!function() {
	"use strict";

	var config = {
		open : '<<',
		close : '>>'
	};

	var tool = {
		exp : function(str) {
			return new RegExp(str, 'g');
		},
		// 匹配满足规则内容
		query : function(type, _, __) {
			var types = [ '#([\\s\\S])+?', // js语句
			'([^{#}])*?' // 普通字段
			][type || 0];
			return exp((_ || '') + config.open + types + config.close + (__ || ''));
		},
		escape : function(html) {
			return String(html || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
		},
		error : function(e, tplog) {
			var error = 'Laytpl Error：';
			typeof console === 'object' && console.error(error + e + '\n' + (tplog || ''));
			return error + e;
		}
	};

	var exp = tool.exp, Tpl = function(tpl) {
		this.tpl = tpl;
	};

	Tpl.pt = Tpl.prototype;

	window.errors = 0;

	// 编译模版
	Tpl.pt.parse = function(tpl, data) {
		var that = this, tplog = tpl;
		var jss = exp('^' + config.open + '#', ''), jsse = exp(config.close + '$', '');

		tpl = tpl.replace(/\s+|\r|\t|\n/g, ' ').replace(exp(config.open + '#'), config.open + '# ')

		.replace(exp(config.close + '}'), '} ' + config.close).replace(/\\/g, '\\\\')

		.replace(/(?="|')/g, '\\').replace(tool.query(), function(str) {
			str = str.replace(jss, '').replace(jsse, '');
			return '";' + str.replace(/\\/g, '') + ';view+="';
		})

		.replace(tool.query(1), function(str) {
			var start = '"+(';
			if (str.replace(/\s/g, '') === config.open + config.close) {
				return '';
			}
			str = str.replace(exp(config.open + '|' + config.close), '');
			if (/^=/.test(str)) {
				str = str.replace(/^=/, '');
				start = '"+_escape_(';
			}
			return start + str.replace(/\\/g, '') + ')+"';
		});

		tpl = '"use strict";var view = "' + tpl + '";return view;';
		// console.log(tpl);

		try {
			that.cache = tpl = new Function('d, _escape_', tpl);
			return tpl(data, tool.escape);
		} catch (e) {
			delete that.cache;
			return tool.error(e, tplog);
		}
	};

	Tpl.pt.render = function(data, callback) {
		var that = this, tpl;
		if (!data)
			return tool.error('no data');
		tpl = that.cache ? that.cache(data, tool.escape) : that.parse(that.tpl, data);
		if (!callback)
			return tpl;
		callback(tpl);
	};

	var laytpl = function(tpl) {
		if (typeof tpl !== 'string')
			return tool.error('Template not found');
		return new Tpl(tpl);
	};

	laytpl.config = function(options) {
		options = options || {};
		for ( var i in options) {
			config[i] = options[i];
		}
	};

	laytpl.v = '1.2';

	"function" == typeof define ? define(function() {
		return laytpl
	}) : "undefined" != typeof exports ? module.exports = laytpl : window.laytpl = laytpl

}();

//保存模板数据
function laytpl_preload(id){
	var obj = $(id);
	if(isNull(window.laytpl_map))window.laytpl_map=[];
	if(isNull(window.laytpl_map[id]))window.laytpl_map[id]=obj.html();
}
/*
laytpl_preload('#aa');
laytpl_render('#aa', {}, function(html){
	
});
*/
//获取模板解析结果，需要提交调用 laytpl_preload 保存模板（适合显示数据会覆盖模板原始数据的场景）
function laytpl_render(id, data, callback){
	laytpl(window.laytpl_map[id]).render(data, callback);
}


/**
 * 通过值删除数组元素
 * 
 * @param mixed value 元素值
 * @returns array 
 */
function array_del_val(arr, value){
	/*var i = 0;
	for(i in arr){
		if(arr[i] == value) break;
	}
	return arr.slice(0, i).concat(arr.slice(parseInt(i, 10) + 1));*/
	var new_arr = [];
	for(i in arr){
		if(arr[i] == value) continue;
		new_arr[i] = arr[i];
	}
	return new_arr;
}

/**
 * 通过索引删除数组元素
 * 
 * @param int index 元素索引
 * @returns array
 */
function array_del_index(arr, index){
	return arr.slice(0, index).concat(arr.slice(parseInt(index, 10) + 1));
}
/**
 * Simple Map
 * 
 * 
 * var m = new Map();
 * m.put('key','value');
 * ...
 * var s = "";
 * m.each(function(key,value,index){
 *         s += index+":"+ key+"="+value+"\n";
 * });
 * alert(s);
 * 
 * @author dewitt
 * @date 2008-05-24
 */
function Map() {
	/** 存放键的数组(遍历用到) */
	this.keys = new Array();
	/** 存放数据 */
	this.data = new Object();

	/**
	 * 放入一个键值对
	 * @param {String} key
	 * @param {Object} value
	 */
	this.put = function(key, value) {
		if (this.data[key] == null) {
			this.keys.push(key);
		}
		this.data[key] = value;
	};

	/**
	 * 获取某键对应的值
	 * @param {String} key
	 * @return {Object} value
	 */
	this.get = function(key) {
		return this.data[key];
	};

	/**
	 * 删除一个键值对
	 * @param {String} key
	 */
	this.remove = function(key) {
		this.keys=array_del_val(this.keys, key);
		delete (this.data[key]);
	};

	/**
	 * 清空
	 */
	this.clear = function() {
		this.keys = new Array();
		this.data = new Object();
	};

	/**
	 * 遍历Map,执行处理函数
	 * 
	 * @param {Function} 回调函数 function(key,value,index){..}
	 */
	this.each = function(fn) {
		if (typeof fn != 'function') {
			return;
		}
		var len = this.keys.length;
		for (var i = 0; i < len; i++) {
			var k = this.keys[i];
			fn(k, this.data[k], i);
		}
	};

	/**
	 * 获取键值数组(类似Java的entrySet())
	 * @return 键值对象{key,value}的数组
	 */
	this.entrys = function() {
		var len = this.keys.length;
		var entrys = new Array(len);
		for (var i = 0; i < len; i++) {
			entrys[i] = {
				key : this.keys[i],
				value : this.data[i]
			};
		}
		return entrys;
	};

	/**
	 * 判断Map是否为空
	 */
	this.isEmpty = function() {
		return this.keys.length == 0;
	};

	/**
	 * 获取键值对数量
	 */
	this.size = function() {
		return this.keys.length;
	};

	/**
	 * 重写toString 
	 */
	this.toString = function() {
		var s = "{";
		for (var i = 0; i < this.keys.length; i++, s += ',') {
			var k = this.keys[i];
			s += k + "=" + this.data[k];
		}
		if(s.length > 1){
			s = s.substring(0,s.length-1);
		}
		s += "}";
		return s;
	};
}

function testMap() {
	var m = new Map();
	m.put('key1', '111');
	m.put('key2', '222');
	m.put('key3', '333');
	log("init:" + m);


	m.put('key1', '111a');
	log("set key1:" + m);

	m.remove("key2");
	log("remove key2: " + m);

	var s = "";
	m.each(function(key, value, index) {
		s += index + ":" + key + "=" + value + "\n";
	});
	log(s);
}
//$(function (){
//	testMap()	
//});

//get_bool_str(boolean s, String trueStr, String falseStr)
function get_bool_str(s, trueStr, falseStr) {
	return s ? trueStr : falseStr;
}
//get_expr_str(int s, String greaterStr, String equalStr, String lessStr)
function get_expr_str(s, greaterStr, equalStr, lessStr) {
	s = parseFloat(s, 10);
	if(s > 0)return greaterStr;
	if(s < 0)return lessStr;
	return lessStr;
}
//get_checked(boolean checked)
function get_checked(checked) {
	return checked ? 'checked' : '';
}
//get_selected(boolean selected)
function get_selected(selected) {
	return selected ? 'selected' : '';
}




//websocket简单封装
function XWebSocket(url, cfg, protocols) {
	this.WebSocket = window['MozWebSocket'] ? MozWebSocket : window['WebSocket'] ? WebSocket : null;
	this.url = url;
	this.ws = null;
	this.cfg = cfg;
	this.protocols = protocols;
	this.is_connecting = false;
	this.timer = null;
}
//打开WebSocket连接
XWebSocket.prototype.open = function() {
	var _this = this;
	if(this.is_connecting){
		log('connecting');
		return;
	}
	this.is_connecting = true;
	_this.clear_timer();

	if(this.ws){
		delete(this.ws);
	}
	if ( this.protocols ) {
		this.ws = window['MozWebSocket'] ? new MozWebSocket(this.url, this.protocols) : window['WebSocket'] ? new WebSocket(this.url, this.protocols) : null;
	} else {
		this.ws = window['MozWebSocket'] ? new MozWebSocket(this.url) : window['WebSocket'] ? new WebSocket(this.url) : null;
	}
	if(!this.ws)return;
	
	if(this.cfg.timeout){
		this.timer = window.setTimeout(function(){
			if (_this.ws && _this.ws.readyState != _this.WebSocket.OPEN) {
				_this.close();
				_this.cfg.ontimeout&&_this.cfg.ontimeout('Transport timed out');
			}	
		}, this.cfg.timeout);
	}

	//连接发生错误的回调方法
	this.ws.onerror = function (event) {
		_this.is_connecting = false;
		_this.clear_timer();
		_this.cfg.onerror&&_this.cfg.onerror(this,event);
	};

	//连接成功建立的回调方法
	this.ws.onopen = function (event) {
		_this.is_connecting = false;
		_this.clear_timer();
		_this.cfg.onopen&&_this.cfg.onopen(this,event);
	}

	//接收到消息的回调方法
	this.ws.onmessage = function (event) {
		//log(event.data);
		_this.cfg.onmessage&&_this.cfg.onmessage(this,event);
	}

	//连接关闭的回调方法
	this.ws.onclose = function (event) {
		_this.is_connecting = false;
		_this.clear_timer();
		_this.cfg.onclose&&_this.cfg.onclose(this,event);
		if(_this.cfg.retry){
			if(_this.cfg.retry_timeout){
				window.setTimeout(function (){_this.open();}, _this.cfg.retry_timeout);
			}else{
				_this.open();
			}
			
		}
	}


	//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
	//window.onbeforeunload = function () {
	//	_this.close();
	///}
}
//关闭WebSocket连接
XWebSocket.prototype.close = function() {
	this.ws && this.ws.close();
}
//发送消息
XWebSocket.prototype.send = function(message) {
	if(!this.ws){
		log("The socket is not open.");
		return;
	}
	if (this.ws.readyState == this.WebSocket.OPEN) {
		this.ws.send(message);
	} else {
		log("The socket is not open.");
	}
	
}
//清空timer
XWebSocket.prototype.clear_timer = function() {
	if(this.timer){
		window.clearTimeout(this.timer);
		this.timer = null;
	}
}


/*
var wSock = new XWebSocket('ws://localhost:8080/websocket',{
	retry : true,//断开重连
	retry_timeout : 1000,//断开重连时间
	onopen : function (){
		log("onopen");
		wSock.send('333');
	},
	onerror : function (){
		log("onerror");
	},
	onmessage : function (){
		log("onmessage");
	},
	onclose : function (){
		log("onclose");
	},
	ontimeout : function (){
		log("timeout");
	}
});
wSock.open();
*/


/*
http://www.cnblogs.com/liuqiyun/p/6396434.html
https://www.oschina.net/code/snippet_12_3638
*/
/*
"{0}love {1}".format("ss","ddd");
*/
String.prototype.format=function(){
	var args=arguments;
	return this.replace(/\{(\d+)\}/g,function (m,i){return args[i];});
} 
