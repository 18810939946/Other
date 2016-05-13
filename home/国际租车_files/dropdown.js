var box_pickup = $('#indexes_box_pickup_box');
var box_dropoff = $('#indexes_box_dropoff_box');

function do_search(key,box,isPickup){

    var search_box = box.find('.new_search_op');
    if(search_box[0]){
        search_box.html('loading...');
    }

    setTimeout(function(){
        var requestCount = 0;
        $.ajax({
            url: "/api/region/search/" + key,
            //url: "http://w.zuzuche.com/api/get_region_city_pickup_json_3.php?from=pc&action=ser2&keyword="+key+"&_=1452768609601",

            jsonp: "callback",

            dataType: "jsonp",

            requestCount: ++requestCount,

            success: function( response ) {
                if (requestCount !== this.requestCount) return;
                callback_search(response,box,isPickup);
            }
        });
    },50);
}

function callback_search(data,box,isPickup){
    var search_box = box.find('.new_search_op');
    if(search_box[0]){
        search_box.remove();
    }
    box.find('.event_show_city').hide();
    box.find('.event_search_area').remove()
    box.find('#hotList').after($('#search-template').tmpl(data.info));
    box.find('.event_search_area').find('.event_location').eq(0).addClass('onCity');
    box.find('.event_location').click(function(){
        if(isPickup){
            choose_pickup($(this));
        }
        else{
            choose_dropoff($(this));
        }
    });
}

function callback_city(data,box,isPickup){
    box.append($('#city-template').tmpl(data.info));
    box.find('.search_close').click(function(){
        box.fadeOut();
    });
    box.find('.event_location').click(function(){
        if(isPickup){
            choose_pickup($(this));
        }
        else{
            choose_dropoff($(this));
        }
    });

    $('.event_tab').click(function(){
        var _self = $(this);
        $('.event_tab').removeClass('current');
        _self.addClass('current');
        var data_index = _self.attr('data-index');
        box.find('#hotList').find('.event_hot').each(function(i,item){
            if(i==data_index){
                $(item).show();
            }
            else{
                $(item).hide();
            }
        });
    });
}

function choose_pickup(obj){
    var search_area = box_pickup.find('.event_search_area');
    if(!obj.hasClass('onCity')){
        search_area.find('.event_location').removeClass('onCity');
        obj.addClass('onCity');
    }

    if(obj.attr('data-type')=='city'){
        $('#pickup').val(obj.attr('city_cn')+','+obj.attr('region')).click();
        do_search(obj.attr('city_cn'),box_pickup,true);
    }
    else{
        $('#pickup').val(obj.attr('name_cn')+','+obj.attr('region')).click();
        if($('#dropoff').val() ==''){
            $('#dropoff').val(obj.attr('name_cn')+','+obj.attr('region'));
        }
        box_pickup.hide();
    }
}

function choose_dropoff(obj){
    var search_area = box_dropoff.find('.event_search_area');
    if(!obj.hasClass('onCity')){
        search_area.find('.event_location').removeClass('onCity');
        obj.addClass('onCity');
    }

    if(obj.attr('data-type')=='city') {
        $('#dropoff').val(obj.attr('city_cn') + ',' + obj.attr('region')).click();
        do_search(obj.attr('city_cn'),box_dropoff,false);
    }
    else {
        $('#dropoff').val(obj.attr('name_cn') + ',' + obj.attr('region'));
        box_dropoff.hide();
    }
}

function init(id1, id2, box, isPickup){
    $(id1).click(function(){
        var _self = $(this);
        if(_self[0].hasAttribute('disable')){
            return false;
        }
        var hot_list = box.find('.ui-selector-city');
        if(!hot_list[0]){
            $.ajax({
                url: "/api/region/hot",
                //url:"http://w.zuzuche.com/api/get_region_city_pickup_json_3.php?from=pc&action=history&from=pc&_=1452772910072",

                jsonp: "callback",

                dataType: "jsonp",

                success: function( response ) {
                    callback_city(response,box,isPickup);
                    _self[0].removeAttribute('disable');
                },

                async:false
            });
        }
        var val = $(id2).val();
        if(val!=''){
            /*var key = val;
             //妫€绱�
             $.ajax({
             url: "http://w.zuzuche.com/api/get_region_city_pickup_json_3.php?from=pc&action=ser2&keyword="+key+"&_=1452768609601",

             jsonp: "callback",

             dataType: "jsonp",

             success: function( response ) {
             callback_search(response,box,isPickup);
             }
             });*/
        }
        var top = _self.offset().top;
        var left = _self.offset().left;
        box.css({left:left+'px',top:(top+_self.height())+'px'});
        box.fadeIn();
    });

    $(id2).bind('input propertychange', function() {
        if($(this).val().length==0) {
            box.find('.event_search_area').remove();
            box.find('.event_show_city').show();
        }
        else if($(this).val().length>1){
            var key = $(this).val();
            do_search(key,box,isPickup);
        }
        else{
            console.log('have to input more than 2 letters');
        }
    }).keydown(function(e){
        var search_area = box.find('.event_search_area');
        var current = search_area.attr('index');
        current = current?parseInt(current):0;
        var len = box.find('.event_search_area').find('.event_location').length;
        if(e.keyCode==38){
            //up
            var next_index = current-1;
            if(next_index<0){
                next_index = len-1;
            }
            search_area.attr('index',next_index);
            search_area.find('.event_location').eq(current).removeClass('onCity');
            search_area.find('.event_location').eq(next_index).addClass('onCity');
        }
        if(e.keyCode==40){
            //down
            var next_index = current+1;
            if(next_index>=len){
                next_index = 0;
            }
            search_area.attr('index',next_index);
            search_area.find('.event_location').eq(current).removeClass('onCity');
            search_area.find('.event_location').eq(next_index).addClass('onCity');
        }
        if(e.keyCode==13){

            var obj = search_area.find('.onCity');
            if(isPickup){
                choose_pickup(obj);
            }
            else{
                choose_dropoff(obj);
            }
            return false;
        }
    });
}