/*
//Temp Code for prototype
var current_clip;
current_clip.start_time = 10;
current_clip.end_time = 15;

//Front-end code
var clips_data_JSON;
var clips_data = [];
var current_project_id = "someID number";

//Clip Data Structure
var clip_ex = new Object();
clip_ex.start_time = 15; //in ms
clip_ex.end_time = 120;  //in ms
clip_ex.source_video_id = "someID";
clip_ex.clip_id = "someIDAs well";
ciip_ex.filters = " ";//{};// array of filter info, will get into later
*/

//Adds video at correct location, and generates an ID for it?
function addClipToData(clip){
	//Insert clip in chronological index\
	for(var i = 0; i < clips_data.length; i ++){
		if(clips_data[i].start_time > clip.start_time){
			clips_data.splice(i, 0, clip);
			inserted = true;
			return;
		}
	}
	clips_data.push(clip);
}

//Remove clip from data
function removeClipFromData(clip){
	var clip_id = clip.clip_id;
	for(var i = 0; i < clips_data.length; i ++){
		if(clips_data[i].clip_id == clip_id){
			clips_data.splice(i,1);
		}
		return;
	}
	console.log("clip not found in data array");
}

//If clip is updated, its time might change, so remove it and reinsert it into the array 
function updateClip(clip){
	removeClipFromData(clip);
	addClipToData(clip);
}

function convertDataToJSON(){
	clips_data_JSON = "{project_id:" + current_project_id +", clips: [";
	for(var i = 0; i < clips_data.length; i ++){
		clips_data_JSON += "{ ";
		clips_data_JSON += "'clip_id' : " +         clips_data[i].clip_id;
		clips_data_JSON += "'source_video_id' : " + clips_data[i].source_video_id;
		clips_data_JSON += "'start_time' : " +      clips_data[i].start_time;
		clips_data_JSON += "'end_time' : " + 	    clips_data[i].end_time;
		clips_data_JSON += "'filters' : " +	        clips_data[i].filters;
		clips_data_JSON += " }";
	}
	clips_data_JSON += "]}";
}

function convertJSONtoData(json){
	var parsed = JSON.parse(infoJSON);
	current_project_id = parsed.project_id;
	clips_data = parsed.clips;
}

// intial loading
var starttime = 10;
var endtime = 15;
var starttime2 = 20;
var endtime2 = 24;

function init() {
	$("video").on('loadedmetadata', requestPlay);
}

$(document).ready(function() {
	init();

	// initialize slider
	$("#slider").slider({
        min: 0,
        max: 39, // this should be currentclip.totalTime
        step: 1,
        values: [10, 15],
        slide: function(event, ui) {
            for (var i = 0; i < ui.values.length; ++i) {
                $("input.sliderValue[data-index=" + i + "]").val(ui.values[i]);
            }
        }
    });

	$("#slider2").slider({
        min: 0,
        max: 39, // this should be currentclip.totalTime
        step: 1,
        values: [20, 24],
        slide: function(event, ui) {
            $("input.sliderValue[data-index=2]").val(ui.values[0]);
            $("input.sliderValue[data-index=3]").val(ui.values[1]);
        }
    });

    $("input.sliderValue").change(function() {
        var $this = $(this);
        $("#slider").slider("values", $this.data("index"), $this.val());
    });
});

function cutClip(clip_id) {
	$("video").get(0).pause();
	console.log("cut");
	console.log(clip_id);

	if(clip_id == 1) {
		starttime = $("#start").val();
		endtime = $("#end").val();

		console.log("start" + starttime);
		console.log("end" + endtime);
	}
	if(clip_id == 2) {
		starttime2 = $("#start2").val();
		endtime2 = $("#end2").val();

		console.log("start2" + starttime2);
		console.log("end2" + endtime2);
	}
}

function getClipsJSON (){
	return clips_data_JSON;
}

function getClipsObjectArray (){
	return clips_data; //Warning: big security risk here, probably should clone; but the caveat is that deep cloning is a lot slower...
}

//Gonna needs:
//Undo
function undo(){
	//Send request to server for undo
	var returnedJSON = "";
	clips_data_JSON = returnedJSON;
	convertJSONtoData(returnedJSON);
}
//Redo
function redo(){
	//Send request to server for redo
	var returnedJSON = "";
	clips_data_JSON = returnedJSON;
	convertJSONtoData(returnedJSON);
}

//Modify Clip
function clipWasModified(clip){
	updateClip(clip);
}
//Request Play 
function requestPlay(){
	var dirty = 0;
	$("video").get(0).play();

	$("video").on('timeupdate', function() {
		if(this.currentTime != starttime && dirty == 0) {
			this.currentTime = starttime;
			dirty = 1;
		}
		if(this.currentTime > endtime && dirty == 1) {
			this.currentTime = starttime2;
			this.play();
			dirty = 2;
		}
		if(this.currentTime > endtime2 && dirty == 2) {
			this.pause();
		}
	});
}

$(function () {

    /* basic */

    var scalingFactor = 10;
    $.ajax({
    	type: "GET",
    	url: "http://cinemeow.herokuapp.com/project?id=528a6b61e8f3c650ef000001",
	    success: function(data) {
            project = data;
            $('#title').text(project.name);
            $('#created_at').text("Created on "+project.created_at);  
            for (var i in project.clips) {
            	console.log("start time: " + project.clips[i]["start_time"]); 
                var clip=project.clips[i];
                var color="#"+Math.floor((Math.random()*7216)+15770000).toString(16); // lol
                $("#drag-x").append('<div id="drag'+i+'" class="drag clip" style="background-color:'+color+'">'+clip.name+'</div>');
                $("#log").append('<input type="text" id="start'+i+'" value="'+project.clips[i]["start_time"]+'">');
                $("#log").append('<input type="text" id="end'+i+'" value="'+project.clips[i]["end_time"]+'"><br/>');
            }
            for (var i in project.clips) {
   				$("#drag"+i).offset({left: project.clips[i]["start_time"]*scalingFactor});
                $("#drag"+i).width((project.clips[i]["end_time"]-project.clips[i]["start_time"])*scalingFactor);
                console.log("width " + (project.clips[i]["end_time"]-project.clips[i]["start_time"])*scalingFactor);
            }

            $("#dragbasic div[id^='drag']").draggable({
                containment: "#dragbasic",
                stack: ".drag"
            });

            /* X axis only */
            $("#drag-x div[id^='drag']").draggable({
                    containment: "#drag-x",
                    stack: ".drag",
                    axis: "x",
                    grid: [1,1],  
                    snap: true,
                    snapTolerance: 5  
            });
     
            /* make draggable div always on top */
            $("div[id^='drag']").mousedown(function () {
                    $("div[id^='drag']").each(function () {
                            var seq = $(this).attr("id").replace("drag", "");
                            $(this).css('z-index', seq);
                    });
            });
            $(".clip").resizable({
                handles: 'e, w', 
                minWidth: 15, //maxwidth will be determined by video clip!
                minHeight: 70,
                containment: "#drag-x"
            }); 
            $(".clip").resize(function(e){
                var position = $(this).offset();
                var offset = $("#drag-x").offset().left;
                var start = position.left - offset ; // TODO
                var width = $(this).width() / scalingFactor;
                //e.stopPropagation();
                //$(this).text("");
                $(info).text("start:" + start + " end: " + (start+width) + " length: "+ width);
            } );
            $(".clip").bind("drag", function(e){
              var position = $(this).offset();
                var start = position.left; // TODO
                var width = $(this).width() /scalingFactor;
                //e.stopPropagation();
                //$(this).text("");
                $(info).text("start:" + start + " end: " + (start+width) + " length: "+ width);
                /*
                var position = $(this).offset();
                var start = position.left - 14; // TODO
                var width = $(this).width();
                //e.stopPropagation();
                //$(this).text("");
                $(info).text("start:" + start + " end: " + (start+width) + " length: "+ width);
                */
            } );
            $(".clip").mouseover(function () {
                //$(this).css('opacity', '1');
            });
            $(".clip").mouseout(function () {
                $(this).css('opacity', '.7');
            });
        },
        error: function(XMLHTTPRequest, textStatus, error) {
            console.log(XMLHTTPRequest+" "+error);
        }
    });
    /*$( ".slider-range" ).slider({
		range: true,
		min: 0,
		max: 500,
		values: [ 75, 300 ],
		slide: function( event, ui ) {
			$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
		}
	});
	$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
		" - $" + $( "#slider-range" ).slider( "values", 1 ) );
	*/
	});
