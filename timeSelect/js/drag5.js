/**
 * Created by juicy on 2018-3-10.上一稳定版本为drag2，添加左边左滑
 * 按格子移动，数据格式为日期
 */
var itemX2;

(function($) {
	'use strict';
	$.fn.initJuicy2 = function(data) {
		return new MyinitJuicy2(data, this);
	};
	var perwidth2 = 0;
	var MyinitJuicy2 = function(data, that) {
		console.log(data)
		var me2 = this;
		me2.init2(data[0], that);
        me2.init2(data[1], that);
		me2.offsetleft2 = $(that).offset().left + 80;
	};

	MyinitJuicy2.prototype.getdata = function() {
		var backdata2 = [];
		var monday = $(".kaoqing2").data("monday");
		$.each($(".weekday2"), function(i, obj) {
			var thisday2 = getNextDate(monday, i);
			$.each($(obj).find(".itemT"), function(j, obj1) {
				var x = parseFloat($(obj1).css("left")) / perwidth2;
				var y = parseFloat($(obj1).css("width")) / perwidth2 + x;
				var startime2 = Math.round(x) % 2 == 0 ? (thisday2 + " " +  ("0"+Math.round(x) / 2).slice(-2) + ":00:00") : (thisday2 + " " + ("0"+ parseInt(Math.round(x) / 2)).slice(-2) + ":30:00");
				var endtime2 = Math.round(y) % 2 == 0 ? (thisday2 + " " + ("0"+Math.round(y) / 2).slice(-2) + ":00:00") : (thisday2 + " " + ("0"+parseInt(Math.round(y) / 2)).slice(-2) + ":30:00");
				console.log(startime2)
				backdata2.push({
					startime2: startime2,
					endtime2: endtime2
				});
			});

		})

		return backdata2;
	}
	// 初始化
	MyinitJuicy2.prototype.init2 = function(data, that) {
		var me2 = this;
		me2.current = 0; //新增编号
		me2.cando = true; //当前位置是否允许新增
		me2.nowmove = -1; //当前向左向右拖动的序号
		me2.newcreate = true;
		me2.opts = $.extend(true, {}, { //用于设弹窗默认值
			width: 900,
			mondayDate: '',
			timedata: [], //[{startime2:,endtime2:},]
			status: true,
			data1: [{
				"type": "周一",
				"time2Slot": []
			}, {
				"type": "周二",
				"time2Slot": []
			}, {
				"type": "周三",
				"time2Slot": []
			}, {
				"type": "周四",
				"time2Slot": []
			}, {
				"type": "周五",
				"time2Slot": []
			}, {
				"type": "周六",
				"time2Slot": []
			}, {
				"type": "周日",
				"time2Slot": []
			}]
		}, data);
		me2.mousedown = false;
		//初始化
		var str2 = '';
		var boxwidth2 = me2.opts.width;
		var navwidth2 = me2.opts.width - 90;
		me2.perwidth2 = perwidth2 = navwidth2 / 48;
		$(that).css("width", boxwidth2 + "px");
		$(that).attr("data-monday", me2.opts.mondayDate);
		var data33 = me2.opts.timedata;
		var timedata = me2.opts.data1;
	
		for(var i = 0; i < 1; i++) {
			timedata[i]["type"] += getNextDay(me2.opts.mondayDate, i);
		}
		
		$.each(data33, function(i, obj) {
			var day = new Date(obj.startime2.replace(/-/g,"/")).getDay() - 1;
			if(day == -1) day = 6;
			timedata[day]["time2Slot"].push([getMytime2(obj.startime2), getMytime2(obj.endtime2)]);
		});
		for(var i = 0; i < 1; i++) {
			str2 += '<div class="weekday2">' +
				'<div class=xq2>' + timedata[i].type + '</div>' +
				'<div>' +
				'<div class="day">';
			for(var j = 0; j < 24; j++) {
				str2 += '<div class="hour"><div class="halfhour"></div></div>';
			}
			str2 += '<div class="hour"></div></div><div class="bar">';
			if(timedata.length == 0) {
				str2 += '</div></div></div>';
			} else {
				for(var t = 0; t < timedata[i].time2Slot.length; t++) {
					var left = navwidth2 * timedata[i].time2Slot[t][0] / 24;
					var width = navwidth2 * (timedata[i].time2Slot[t][1] - timedata[i].time2Slot[t][0]) / 24;
					str2 += '<div class="itemT itemTwo' + me2.current + '" style="left:' + left + 'px;width:' + width + 'px" data-num="' + me2.current + '">' +
						'<div class="bleft"></div><div class="bright"></div></div>';
					me2.current++;
				}
				str2 += '</div></div></div>';
			}
		}

		var $str2 = $(str2);
		$(that).append($str2);
		//点在蓝条条上就禁止它新建了
		if(me2.opts.status) {
			$(".bright,.bleft").css("cursor", "e-resize");
			$str2.find(".itemTwo").on('mousedown', function(e) {
				me2.cando = false;
				return false;
			})
			$str2.find(".bar").on('mousedown', function(e) {
				if(me2.cando) {
					me2.mousedown = true;
					me2.newcreate = true;
					fnstart(e, me2, this);
				}
				return false; //防止事件冒泡
			});
			$("body").on('mouseup', function(e) {
				me2.cando = true;
				if(me2.mousedown) {
					me2.mousedown = false;
					fnend(me2);
					me2.nowmove = -1;
				}
				return false; //防止事件冒泡
			});

			$str2.find(".bright").on('mousedown', function(e) {
				me2.mousedown = true;
				me2.newcreate = false;
				me2._startX = e.pageX;
				me2.direction='right';
				me2.width = parseFloat($(this).parent().css("width")); //会实时变化
				me2.left = parseFloat($(this).parent().css("left")); //会实时变化
				me2.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me2.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me2.nowmove = parseFloat($(this).parent().data("num"));
				return false;
			})
			$str2.find(".bleft").on('mousedown', function(e) {
				me2.mousedown=true;
				me2.newcreate = false;
				me2._startX = e.pageX;
				me2.direction='left';
				me2.width = parseFloat($(this).parent().css("width")); //会实时变化
				me2.left = parseFloat($(this).parent().css("left")); //会实时变化
				me2.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me2.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me2.nowmove = parseFloat($(this).parent().data("num"));
				return false; 
			})
			//注意：move事件一定要绑在body上，当鼠标移动过快可能移除那个div区域
			$("body").on('mousemove', function(e) {
				if(me2.mousedown && me2.newcreate) {
					fnmove(e, me2);
				} else if(me2.mousedown && !me2.newcreate) {
					if(me2.direction&&me2.direction=='left'){
						fnmoveleft(e, me2);
					}else if(me2.direction&&me2.direction=='right'){
						fnmoveright(e, me2);
					}
				} else {
					e.preventDefault()
				}

			});
		} else {
			$(".bright,.bleft").css("cursor", "default");
		}

	};
	function fnmoveleft(e, me2) {
		console.log("左边不是新建" + me2.startwidth)
		me2._curX = e.pageX;
		me2._curY = e.pageY;
		me2._moveX = me2._startX - me2._curX;
		var itemTwo = ".itemTwo" + me2.nowmove;
		var left= me2.startleft-me2._moveX;
		var width = me2.startwidth + me2._moveX;
		//左边的向左拉，不超过左边边界
		if(me2._moveX > 0 && me2._moveX < me2.startleft) {
			$(itemTwo).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me2.width = width;
			me2.left = left;
		} else if(me2._moveX > 0 && me2._moveX >= me2.startleft) { //左边的向左拉，超过左边边界
			$(itemTwo).css({
				"width": (me2.startleft+me2.startwidth) + 'px',
				"left": 0
			})
			me2.width = me2.startleft+me2.startwidth;
			me2.left = 0;
		} else if(me2._moveX < 0 && -me2._moveX <= me2.startwidth) { //左边的向右拉,不能超过当前右边的0.5小时
			$(itemTwo).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me2.width = width;
			me2.left = left;
		} else if(me2._moveX < 0 && -me2._moveX > me2.startwidth) { //左边的向右拉,超过最右边
			$(itemTwo).css({
				"width": 0,
				"left": (me2.startwidth + me2.startleft)+ 'px'
			})
			me2.width = 0;
			me2.left = me2.startwidth + me2.startleft;
		}
	}
	function fnmoveright(e, me2) {
		console.log("右边不是新建" + me2.startwidth)
		me2._curX = e.pageX;
		me2._curY = e.pageY;
		me2._moveX = me2._curX - me2._startX;
		var itemTwo = ".itemTwo" + me2.nowmove;
		var left = me2.startleft;
		var width = me2.startwidth + me2._moveX;
		//右边的向右拉，不超过右边边界
		if(me2._moveX > 0 && me2._moveX < me2.perwidth2 * 48 - me2.startleft - me2.startwidth) {
			$(itemTwo).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me2.width = width;
		} else if(me2._moveX > 0 && me2._moveX >= me2.perwidth2 * 48 - me2.startleft - me2.startwidth) { //右边的向右拉，超过右边边界
			$(itemTwo).css({
				"width": (me2.perwidth2 * 48 - left) + 'px',
				"left": left + 'px'
			})
			me2.width = me2.perwidth2 * 48 - left;
		} else if(me2._moveX < 0 && -me2._moveX <= me2.startwidth) { //右边的向左拉,不能超过当前左边的0.5小时
			$(itemTwo).css({
				"width": width + 'px',
				"left": left + 'px'
			})
			me2.width = width;
		} else if(me2._moveX < 0 && -me2._moveX > me2.startwidth) { //右边的向左拉,超过最左边
			$(itemTwo).css({
				"width": 0,
				"left": left + 'px'
			})
			me2.width = 0;
		}
	}
	
	function fnstart(e, me2, that) {
		me2._startX = e.pageX;
		var left = me2._startX - me2.offsetleft2;
		me2.left = nearest(left);
		me2.startleft = nearest(left);
		me2.nowmove = me2.current;
		var str2 = '<div class="itemT itemTwo' + me2.current + '" style="left:' + me2.left + 'px;width:1px"  data-num="' + me2.current + '">' +
			'<div class="bleft"></div><div class="bright"></div></div>';
		me2.current++;
		var itemTwo = ".itemTwo" + (me2.current - 1);
		$(that).append($(str2));
		if(me2.opts.status) {
			$(".bright,.bleft").css("cursor", "e-resize");
			$(itemTwo).on('mousedown', function(e) {
				me2.cando = false;
				return false;
			})

			$(itemTwo).find(".bright").on('mousedown', function(e) {
				me2.mousedown = true;
				me2.newcreate = false;
				me2._startX = e.pageX;
				me2.direction='right';
				me2.width = parseFloat($(this).parent().css("width")); //会实时变化
				me2.left = parseFloat($(this).parent().css("left")); //会实时变化
				me2.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me2.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me2.nowmove = parseFloat($(this).parent().data("num"));
				return false;
			})
			$(itemTwo).find(".bleft").on('mousedown', function(e) {
				me2.mousedown=true;
				me2.newcreate = false;
				me2._startX = e.pageX;
				me2.direction='left';
				me2.width = parseFloat($(this).parent().css("width")); //会实时变化
				me2.left = parseFloat($(this).parent().css("left")); //会实时变化
				me2.startwidth = parseFloat($(this).parent().css("width")); //是个常数
				me2.startleft = parseFloat($(this).parent().css("left")); //是个常数
				me2.nowmove = parseFloat($(this).parent().data("num"));
				return false; 
			})
		} else {
			$(".bleft,.bright").css("cursor", "default");
		}

	}

	function fnmove(e, me2) {
		console.log("新建" + me2.nowmove+me2.left)
		me2._curX = e.pageX;
		me2._curY = e.pageY;
		me2._moveX = me2._curX - me2._startX;
		var itemTwo = ".itemTwo" + (me2.current - 1);
		if(me2._moveX > 0 && me2._moveX < me2.perwidth2 * 48 - me2.startleft) {
			me2.width = me2._moveX;
			$(itemTwo).css("width", me2._moveX + 'px');
//			$(itemTwo).css("width", me2._moveX + 'px')
		} else if(me2._moveX > 0 && me2._moveX >= me2.perwidth2 * 48 - me2.startleft) {
			me2.width = me2.perwidth2 * 48 - me2.startleft;
			$(itemTwo).css("width", (me2.perwidth2 * 48 - me2.startleft) + 'px')
		} else {
			me2.width = 0;
			$(itemTwo).css("width", 0)
		}
	}

	function fnend(me2, i) {
		itemX2=me2.nowmove;//xu加
        console.log("itemX2:"+itemX2)
		var width = me2.width;
		var left = me2.left;
		var itemTwo = ".itemTwo" + me2.nowmove;
		if(width == 0) {
			$(itemTwo).remove();
		} else {
			$(itemTwo).css("width", nearest(width) + "px");
			$(itemTwo).css("left", nearest(left) + "px");
			var result = xiaoxiannvbianshen(itemTwo);
			var items = $(itemTwo).parent().find(".itemTwo");
			if(result.length < items.length) {
				$.each(items, function(i, obj) {
					if(i < result.length) {
						$(obj).css({
							"left": result[i][0] + 'px',
							"width": result[i][1] + 'px'
						})
					} else {
						$(obj).remove();
					}
				});
			}
		}
        $("#getdata2").click()//xu加
		//松手后才能修改值
	}

	function nearest(left) {
		var yu = left % perwidth2;
		if(yu < perwidth2 / 2) {
			return left - yu;
		} else {
			return left + (perwidth2 - yu);
		}
	}

	function getMytime2(date) {
		if(date.split(" ")[1] == "24:00:00") {
			return 24;
		} else {
			var time2 = new Date(date.replace(/-/g,"/"));
			if(time2.getMinutes() > 10) {
				return time2.getHours() + 0.5;
			} else {
				return time2.getHours();
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
		//console.log(d)
		var monday = new Date(d.replace(/-/g,"/"));
		monday = monday.getTime() + 1000 * 60 * 60 * 24 * i;
		monday = new Date(monday);
		return monday.getFullYear() + "-" + ("0"+(monday.getMonth() + 1)).slice(-2) + "-" + ("0"+monday.getDate()).slice(-2);
	}
	function xiaoxiannvbianshen(itemTwo) {
		var array = [];
		var arrayresult = [];
		var $itemTwo = $(itemTwo).parent().find(".itemTwo");
		$.each($itemTwo, function(i, obj) {
			var left = parseFloat($(obj).css("left"));
			var width = parseFloat($(obj).css("width"));
			array.push([left, left + width]);
		});
		var sortarray = bubbleSort(array);
		//var sortarray = array.sort();
		var temp = sortarray[0];
		console.log("排序后2：");
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