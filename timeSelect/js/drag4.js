/**
 * Created by juicy on 2018-3-10.上一稳定版本为drag2，添加左边左滑
 * 按格子移动，数据格式为日期
 */
var itemX;
var flagDiv;
(function($) {
	'use strict';
	$.fn.initJuicy = function(data) {
		return new MyinitJuicy(data, this);
	};
	var perwidth = 0;
	var MyinitJuicy = function(data, that) {
		console.log(data)
		var me = this;
		me.init(data, that);
		me.offsetleft = $(that).offset().left + 80;
	};

	MyinitJuicy.prototype.getdata = function() {
		var backdata = [];
		var monday = $(".kaoqing").data("monday");
		//console.log(monday)
		$.each($(".weekday"), function(i, obj) {
			var thisday = getNextDate(monday, i);
			$.each($(obj).find(".item"), function(j, obj1) {
				var x = parseFloat($(obj1).css("left")) / perwidth;
				var y = parseFloat($(obj1).css("width")) / perwidth + x;
				var startime = Math.round(x) % 2 == 0 ? (thisday + " " +  ("0"+Math.round(x) / 2).slice(-2) + ":00:00") : (thisday + " " + ("0"+ parseInt(Math.round(x) / 2)).slice(-2) + ":30:00");
				var endtime = Math.round(y) % 2 == 0 ? (thisday + " " + ("0"+Math.round(y) / 2).slice(-2) + ":00:00") : (thisday + " " + ("0"+parseInt(Math.round(y) / 2)).slice(-2) + ":30:00");
				backdata.push({
					startime: startime,
					endtime: endtime
				});
			});

		})
		return backdata;
	}
	// 初始化
	MyinitJuicy.prototype.init = function(data, that) {
		var me = this;
		me.current = 0; //新增编号
		me.cando = true; //当前位置是否允许新增
		me.nowmove = -1; //当前向左向右拖动的序号
		me.newcreate = true;
		me.opts = $.extend(true, {}, { //用于设弹窗默认值
			width: 900,
			mondayDate: '',
			timedata: [], //[{startime:,endtime:},]
			status: true,
			data1: [{
				"type": "周一",
				"timeSlot": []
			}, {
				"type": "周二",
				"timeSlot": []
			}, {
				"type": "周三",
				"timeSlot": []
			}, {
				"type": "周四",
				"timeSlot": []
			}, {
				"type": "周五",
				"timeSlot": []
			}, {
				"type": "周六",
				"timeSlot": []
			}, {
				"type": "周日",
				"timeSlot": []
			}]
		}, data);
		me.mousedown = false;
		//初始化
		var str = '';
		var boxwidth = me.opts.width;
		var navwidth = me.opts.width - 90;
		me.perwidth = perwidth = navwidth / 48;
		$(that).css("width", boxwidth + "px");
		$(that).attr("data-monday", me.opts.mondayDate);
		var data3 = me.opts.timedata;
		var timedata = me.opts.data1;
	
	/*	for(var i = 0; i < 7; i++) {
			timedata[i]["type"] += getNextDay(me.opts.mondayDate, i);
		}*/
		
		$.each(data3, function(i, obj) {
			var day = new Date(obj.startime.replace(/-/g,"/")).getDay() - 1;
			if(day == -1) day = 6;
			timedata[day]["timeSlot"].push([getMytime(obj.startime), getMytime(obj.endtime)]);
		});
		for(var i = 0; i < 7; i++) {
			str += '<div class="weekday">' +
				'<div class=xq>' + timedata[i].type + '</div>' +
				'<div>' +
				'<div class="day">';
			for(var j = 0; j < 24; j++) {
				str += '<div class="hour"><div class="halfhour"></div></div>';
			}
			str += '<div class="hour"></div></div><div class="bar">';
			if(timedata.length == 0) {
				str += '</div></div></div>';
			} else {
				for(var t = 0; t < timedata[i].timeSlot.length; t++) {
					var left = navwidth * timedata[i].timeSlot[t][0] / 24;
					var width = navwidth * (timedata[i].timeSlot[t][1] - timedata[i].timeSlot[t][0]) / 24;
					str += '<div class="item item' + me.current + '" style="left:' + left + 'px;width:' + width + 'px" data-num="' + me.current + '">' +
						'<div class="bleft"></div><div class="bright"></div></div>';
					me.current++;
				}
				str += '</div></div></div>';
			}
		}

		var $str = $(str);
		$(that).append($str);
		//点在蓝条条上就禁止它新建了
		if(me.opts.status) {
			$(".bright,.bleft").css("cursor", "e-resize");
			$str.find(".item").on('mousedown', function(e) {
				me.cando = false;
				return false;
			})
			$str.find(".bar").on('mousedown', function(e) {
				if(me.cando) {
					me.mousedown = true;
					me.newcreate = true;
					fnstart(e, me, this);
				}
				return false; //防止事件冒泡
			});
			$("body").on('mouseup', function(e) {
				me.cando = true;
				if(me.mousedown) {
					me.mousedown = false;
					fnend(me);
					me.nowmove = -1;
				}
				return false; //防止事件冒泡
			});

			$str.find(".bright").on('mousedown', function(e) {
				me.mousedown = true;
				me.newcreate = false;
				me._startX = e.pageX;
				me.direction='right';
				me.width = parseFloat($(this).parent().css("width")); //会实时变化
				me.left = parseFloat($(this).parent().css("left")); //会实时变化
				me.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me.nowmove = parseFloat($(this).parent().data("num"));
				return false;
			})
			$str.find(".bleft").on('mousedown', function(e) {
				me.mousedown=true;
				me.newcreate = false;
				me._startX = e.pageX;
				me.direction='left';
				me.width = parseFloat($(this).parent().css("width")); //会实时变化
				me.left = parseFloat($(this).parent().css("left")); //会实时变化
				me.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me.nowmove = parseFloat($(this).parent().data("num"));
				return false; 
			})
			//注意：move事件一定要绑在body上，当鼠标移动过快可能移除那个div区域
			$("body").on('mousemove', function(e) {
				if(me.mousedown && me.newcreate) {
					fnmove(e, me);
				} else if(me.mousedown && !me.newcreate) {
					if(me.direction&&me.direction=='left'){
						fnmoveleft(e, me);
					}else if(me.direction&&me.direction=='right'){
						fnmoveright(e, me);
					}
				} else {
					e.preventDefault()
				}

			});
		} else {
			$(".bright,.bleft").css("cursor", "default");
		}

	};
	function fnmoveleft(e, me) {
		console.log("左边不是新建" + me.startwidth)
		me._curX = e.pageX;
		me._curY = e.pageY;
		me._moveX = me._startX - me._curX;
		var item = ".item" + me.nowmove;
		var left= me.startleft-me._moveX;
		var width = me.startwidth + me._moveX;
		//左边的向左拉，不超过左边边界
		if(me._moveX > 0 && me._moveX < me.startleft) {
			$(item).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me.width = width;
			me.left = left;
		} else if(me._moveX > 0 && me._moveX >= me.startleft) { //左边的向左拉，超过左边边界
			$(item).css({
				"width": (me.startleft+me.startwidth) + 'px',
				"left": 0
			})
			me.width = me.startleft+me.startwidth;
			me.left = 0;
		} else if(me._moveX < 0 && -me._moveX <= me.startwidth) { //左边的向右拉,不能超过当前右边的0.5小时
			$(item).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me.width = width;
			me.left = left;
		} else if(me._moveX < 0 && -me._moveX > me.startwidth) { //左边的向右拉,超过最右边
			$(item).css({
				"width": 0,
				"left": (me.startwidth + me.startleft)+ 'px'
			})
			me.width = 0;
			me.left = me.startwidth + me.startleft;
		}
	}
	function fnmoveright(e, me) {
		console.log("右边不是新建" + me.startwidth)
		me._curX = e.pageX;
		me._curY = e.pageY;
		me._moveX = me._curX - me._startX;
		var item = ".item" + me.nowmove;
		var left = me.startleft;
		var width = me.startwidth + me._moveX;
		//右边的向右拉，不超过右边边界
		if(me._moveX > 0 && me._moveX < me.perwidth * 48 - me.startleft - me.startwidth) {
			$(item).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me.width = width;
		} else if(me._moveX > 0 && me._moveX >= me.perwidth * 48 - me.startleft - me.startwidth) { //右边的向右拉，超过右边边界
			$(item).css({
				"width": (me.perwidth * 48 - left) + 'px',
				"left": left + 'px'
			})
			me.width = me.perwidth * 48 - left;
		} else if(me._moveX < 0 && -me._moveX <= me.startwidth) { //右边的向左拉,不能超过当前左边的0.5小时
			$(item).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me.width = width;
		} else if(me._moveX < 0 && -me._moveX > me.startwidth) { //右边的向左拉,超过最左边
			$(item).css({
				"width": 0,
				"left": left + 'px'
			})
			me.width = 0;
		}
	}
	
	function fnstart(e, me, that) {
		me._startX = e.pageX;
		var left = me._startX - me.offsetleft;
		me.left = nearest(left);
		me.startleft = nearest(left);
		me.nowmove = me.current;
		var str = '<div class="item item' + me.current + '" style="left:' + me.left + 'px;width:1px"  data-num="' + me.current + '">' +
			'<div class="bleft"></div><div class="bright"></div></div>';
		me.current++;
		var item = ".item" + (me.current - 1);
		$(that).append($(str));
		if(me.opts.status) {
			$(".bright,.bleft").css("cursor", "e-resize");
			$(item).on('mousedown', function(e) {
				me.cando = false;
				return false;
			})

			$(item).find(".bright").on('mousedown', function(e) {
				me.mousedown = true;
				me.newcreate = false;
				me._startX = e.pageX;
				me.direction='right';
				me.width = parseFloat($(this).parent().css("width")); //会实时变化
				me.left = parseFloat($(this).parent().css("left")); //会实时变化
				me.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me.nowmove = parseFloat($(this).parent().data("num"));
				return false;
			})
			$(item).find(".bleft").on('mousedown', function(e) {
				me.mousedown=true;
				me.newcreate = false;
				me._startX = e.pageX;
				me.direction='left';
				me.width = parseFloat($(this).parent().css("width")); //会实时变化
				me.left = parseFloat($(this).parent().css("left")); //会实时变化
				me.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me.nowmove = parseFloat($(this).parent().data("num"));
				return false; 
			})
		} else {
			$(".bleft,.bright").css("cursor", "default");
		}

	}

	function fnmove(e, me) {
		console.log("新建" + me.nowmove+me.left)
		me._curX = e.pageX;
		me._curY = e.pageY;
		me._moveX = me._curX - me._startX;
		var item = ".item" + (me.current - 1);
		if(me._moveX > 0 && me._moveX < me.perwidth * 48 - me.startleft) {
			me.width = me._moveX;
			$(item).css("width", me._moveX + 'px');
//			$(item).css("width", me._moveX + 'px')
		} else if(me._moveX > 0 && me._moveX >= me.perwidth * 48 - me.startleft) {
			me.width = me.perwidth * 48 - me.startleft;
			$(item).css("width", (me.perwidth * 48 - me.startleft) + 'px')
		} else {
			me.width = 0;
			$(item).css("width", 0)
		}
	}

	function fnend(me, i) {
		itemX=me.nowmove;//xu加
		var width = me.width;
		var left = me.left;
		var item = ".item" + me.nowmove;
		if(width == 0) {
			$(item).remove();
		} else {
			$(item).css("width", nearest(width) + "px");
			$(item).css("left", nearest(left) + "px");
			var result = xiaoxiannvbianshen(item);
			var items = $(item).parent().find(".item");
            console.log(result.length)
            console.log(items.length)
			if(result.length < items.length) {
				$.each(items, function(i, obj) {
					if(i < result.length) {
						$(obj).css({
							"left": result[i][0] + 'px',
							"width": result[i][1] + 'px'
						})
                        console.log("没移除")
                        console.log($(obj))
					} else {
                        console.log("移除？？？")
						console.log($(obj))
						$(obj).remove();
					}
				});
			}
		}
        $("#getdata").click()//xu加
		//松手后才能修改值
	}

	function nearest(left) {
		var yu = left % perwidth;
		if(yu < perwidth / 2) {
			return left - yu;
		} else {
			return left + (perwidth - yu);
		}
	}

	function getMytime(date) {
		if(date.split(" ")[1] == "24:00:00") {
			return 24;
		} else {
			var time = new Date(date.replace(/-/g,"/"));
			if(time.getMinutes() > 10) {
				return time.getHours() + 0.5;
			} else {
				return time.getHours();
			}
		}

	}

	function getNextDay(d, i) {
		var monday = new Date(d.replace(/-/g,"/"));
		monday = monday.getTime() + 1000 * 60 * 60 * 24 * i;
		monday = new Date(monday);
		return (monday.getMonth() + 1) + "/" + monday.getDate();
	}

	function getNextDate(d, i) {
		var monday = new Date(d.replace(/-/g,"/"));
		monday = monday.getTime() + 1000 * 60 * 60 * 24 * i;
		monday = new Date(monday);
		return monday.getFullYear() + "-" + ("0"+(monday.getMonth() + 1)).slice(-2) + "-" + ("0"+monday.getDate()).slice(-2);
	}
	function xiaoxiannvbianshen(item) {
		var array = [];
		var arrayresult = [];
		var $item = $(item).parent().find(".item");
		$.each($item, function(i, obj) {
			var left = parseFloat($(obj).css("left"));
			var width = parseFloat($(obj).css("width"));
			array.push([left, left + width]);
		});
		var sortarray = bubbleSort(array);
		//var sortarray = array.sort();
		var temp = sortarray[0];
		console.log("排序后：");
		console.log(sortarray);
		for(var i = 0; i < sortarray.length; i++) {
			if(!sortarray[i + 1]) {
				arrayresult.push(temp);
				break
			}
			if(temp[1] < sortarray[i + 1][0]) {
				arrayresult.push(temp);
				temp = sortarray[i + 1];
			} else {
				if(temp[1] <= sortarray[i + 1][1]) {
					temp = [temp[0], sortarray[i + 1][1]];
				} else {
					temp = [temp[0], temp[1]];
				}
			}
		}
		console.log("小仙女变身后：");
		console.log(arrayresult);
		var huanyuan = [];
		for(var j = 0; j < arrayresult.length; j++) {
			huanyuan.push([arrayresult[j][0], arrayresult[j][1] - arrayresult[j][0]]);
		}
		return huanyuan;
	}

	function bubbleSort(array) {
		for(var unfix = array.length - 1; unfix > 0; unfix--) {
			for(var i = 0; i < unfix; i++) {
				if(array[i][0] > array[i + 1][0]) {
					var temp = array[i];
					array.splice(i, 1, array[i + 1]);
					array.splice(i + 1, 1, temp);
				}
			}
		}
		return array;
	}
})(window.Zepto || window.jQuery)