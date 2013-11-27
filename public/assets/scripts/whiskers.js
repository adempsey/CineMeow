//Adds video at correct location, and generates an ID for it?
function addClipToData(clip){
	//Insert clip in chronological index\
	for(var i = 0; i < clips_data.length; i ++){
		if(clips_data[i].timeline_start_time > clip.timeline_start_time){
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
		clips_data_JSON += "'clip_id' : " +             clips_data[i].clip_id;
		clips_data_JSON += "'source_video_id' : " +     clips_data[i].source_video_id;
		clips_data_JSON += "'clip_start_time' : " +     clips_data[i].clip_start_time;
        clips_data_JSON += "'timeline_start_time' : " + clips_data[i].timeline_start_time;
		clips_data_JSON += "'clip_length' : " + 	    clips_data[i].clip_length;
		clips_data_JSON += "'filters' : " +	            clips_data[i].filters;
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
	var i = 0;
	$("video").get(0).play();
	var starttime, endtime;

	$("video").on('timeupdate', function() {
		if(i == project.clips.length) {
			this.pause();
			i = 0;
			return false;
		}

		starttime = $("#start" + i).val();
		endtime = $("#length" + i).val();

		if(this.currentTime != starttime && dirty == 0) {
			this.currentTime = starttime;
			dirty = 1;
		}

		if(this.currentTime > endtime && dirty == 1) {;
			dirty = 0;
			i++;
		}
	});
}

function requestPause() {
	$("video").get(0).pause();
}

/* Note: this is assuming:
* - project.clips[i] exists
* - the clip is not already in the timeline
* TODO: make it so you also have to specify where the clip shows up in the timeline (for drag n drop)
*/
function addClipToTimeline(i,color){
    var scalingFactor = 10;
    var timelineid = "#drag-x";
    var clip=project.clips[i];
    var color="#"+Math.floor((Math.random()*7216)+15770000).toString(16); // lol
    $(timelineid).append('<div id="drag'+i+'" class="drag clip" style="background-color:'+color+'">'+clip.name+'</div>');
    $("#drag"+i).offset({left: project.clips[i]["timeline_start_time"]*scalingFactor + $(timelineid).offset().left} );
    $("#drag"+i).width((project.clips[i]["clip_length"])*scalingFactor);
    console.log("width " + (project.clips[i]["clip_length"])*scalingFactor);
    $("#drag"+i).draggable({
                    containment: timelineid,
                    stack: ".drag",
                    axis: "x",
                    grid: [1,1],  
                    snap: true,
                    snapTolerance: 5, 
                    stop: function() {
                        console.log("saving clips!");
                        saveClips();
                    },
                    drag: function(e){
                        var position = $(this).offset();
                        var offset = $(timelineid).offset().left;
                        var start = (position.left - offset) / scalingFactor -.6; 
                        var width = $(this).width() / scalingFactor;
                        //e.stopPropagation();
                        //$(this).text("");
                        $("#info").text("start:" + start + " end: " + (start+width) + " length: "+ width);
                        var idnum2 = $(this).attr('id');//.substring(5);//"drag"
                        var idnum = idnum2.substring(4);//"drag"
                        $("#start" + idnum).val(start);
                        $("#length" + idnum).val(width);
                    }
    });
    /* make draggable div always on top */
    $("#drag"+i).mousedown(function () {
            $("div[id^='drag']").each(function () {
                    var seq = $(this).attr("id").replace("drag", "");
                    $(this).css('z-index', seq);
            });
    });
    $("#drag"+i).resizable({
        handles: 'e, w', 
        minWidth: 10, //maxwidth will be determined by video clip!
        minHeight: 70,
        containment: timelineid
    }); 
    $("#drag"+i).resizable( "option", "maxWidth", 39*scalingFactor/*project.clips[i].*/ );
    $("#drag"+i).resize(function(e){
        var position = $(this).offset();
        var offset = $(timelineid).offset().left;
        var start = (position.left - offset) / scalingFactor - .6; 
        var width = $(this).width() / scalingFactor;
        //e.stopPropagation();
        //$(this).text("");
        $("#info").text("start:" + start + " end: " + (start+width) + " length: "+ width);
        var idnum2 = $(this).attr('id');//.substring(5);//"drag"
        var idnum = idnum2.substring(4);//"drag"
        $("#start" + idnum).val(start);
        $("#length" + idnum).val(width);

        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(resizeend, delta);
        }
    } );
    $("#drag"+i).mouseover(function () {
        //$(this).css('opacity', '1');
    });
    $("#drag"+i).mouseout(function () {
        $(this).css('opacity', '.7');
    });

}
function resizeend() {
    var rtime = new Date(1, 1, 2000, 12,00,00);
    var timeout = false;
    var delta = 200;
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        saveClips();
    }               
}
$(function () {

    /* basic */
    var timelineid = "#drag-x";


    $.ajax({
    	type: "GET",
    	url: "http://cinemeow.herokuapp.com/project?id=528a6b61e8f3c650ef000001",
	    success: function(data) {
            project = data;
            $('#title').text(project.name);
            $('#created_at').text("Created on "+project.created_at);  
            for (var i in project.clips) {
                var clip=project.clips[i];
                var color="#"+Math.floor((Math.random()*7216)+15770000).toString(16); // lol
                //$(timelineid).append('<div id="drag'+i+'" class="drag clip" style="background-color:'+color+'">'+clip.name+'</div>');
                addClipToTimeline(i, color);
                i++;
                $("#log").append('Clip ' + i);
                i--;
                $("#log").append('<input type="text" id="start'+i+'" value="'+project.clips[i]["timeline_start_time"]+'">');
                $("#log").append('<input type="text" id="length'+i+'" value="'+project.clips[i]["length"]+'"><br/>');
            }
          
            init();
        },
        error: function(XMLHTTPRequest, textStatus, error) {
            console.log(XMLHTTPRequest+" "+error);
        }
        });
    });

function saveClips() {
	$("#change_message").text("Saving changes...");
	var projectJSON;
	for(var i = 0; i < project.clips.length; i++) {
		project.clips[i]["time_line_start_time"] = $("#start" + i).val();
		project.clips[i]["length"] = $("#length" + i).val();
	}

	projectJSON = JSON.stringify(project);
	console.log(projectJSON);
	console.log(project);

	$.ajax({
		type: "POST",
		url: "http://cinemeow.herokuapp.com/editproject",
		data: "id="+project._id+"&data="+projectJSON,
		success: function(data) {
			console.log("successfully updated "+data);
			$("#change_message").text("Changes saved automatically");
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(errorThrown);
			$("#change_message").css("color: #FF0000;");
			$("#change_message").text("Warning: Error saving changes");
		}
	});
}

//Video Clips Menu

$(function(){
    /*for (var i in project.clips) {
        var clip=project.clips[i];
        var color="#"+Math.floor((Math.random()*7216)+15770000).toString(16); // lol
        $("#drag-clipsviewer").append('<div id="dragclip'+i+'" class="drag clip" style="background-color:'+color+'">'+clip.name+'</div>');
    }
    for (var i in project.clips) {
        $("#dragclip"+i).offset({left: project.clips[i]["start_time"]*scalingFactor + $("#drag-clipsviewer").offset().left} );
        $("#dragclip"+i).width((project.clips[i]["end_time"]-project.clips[i]["start_time"])*scalingFactor);
        console.log("width " + (project.clips[i]["end_time"]-project.clips[i]["start_time"])*scalingFactor);
    }*/
    var container_count = 2;
    //HARDCODED:
      $("#drag-clipsviewer").append('<table id="clipsource'+0+'"  class= "clip_source" style=" width: 530px, background-color: black"> </table>');
      $("#drag-clipsviewer").append('<table id="clipsource'+1+'"  class= "clip_source" style=" width: 530px, background-color: black"> </table>');
      $("#clipsource" +0).append('<tr> <td> <div id="dragclone'+0+'"  class="drag_clone" > drag </div> </td>'
                                       +'<td> <div id="clipcontainer'+0+'" class="clip_container" style="background-color: E0F0FF"> </div> </td>'
                                 +'</tr>');
      $("#clipsource" +1).append('<tr> <td> <div id="dragclone'+1+'"  class="drag_clone" > drag </div> </td>'
                                       +' <td> <div id="clipcontainer'+1+'" class="clip_container" style="background-color: E0F0FF"> </div> </td>'
                                  +' </tr>');
      var color="#"+Math.floor((Math.random()*7216)+15770000).toString(16); // lol
      $("#clipcontainer" +0).append('<div id="dragclip'+0+'" class="dragclip drag" style="background-color:'+color+'"> some clip </div>');
      var color="#"+Math.floor((Math.random()*7216)+15770000).toString(16); // lol
      $("#clipcontainer" +1).append('<div id="dragclip'+1+'" class="dragclip drag" style="background-color:'+color+'"> some other clip </div>');
    /* X axis only */
    for(var i = 0; i < container_count; i ++){
        $("#dragclip"+i).draggable({
                containment: "#clipcontainer" + i,
                stack: ".dragclip",
                axis: "x",
                grid: [1,1],  
                snap: true,
                snapTolerance: 5, 
                stop: function() {
                    //console.log("saving clips!");
                    //saveClips();
                }
                //,
                //drag: function(e){
                //}
        });
        $("#dragclip"+i).resizable({
            handles: 'e, w', 
            minWidth: 10, //maxwidth will be determined by video clip!
            minHeight: 70,
            maxWidth: 500,
            //containment: "#clipcontainer" + i,
            //TODO GET CONTAINMENT WORKING DYNAMICALLY
            //containment: "#drag-clipsviewer"//containment: "#clipcontainer"+i
        });
    }
    
    /* $(".drag_clone" ).mouseover(function () {
        $(this).css('opacity', '1');
    });
    $(".drag_clone" ).mouseout(function () {
        $(this).css('opacity', '.7');
    });*/


     $( ".drag_clone" ).draggable({
        helper: function(event) {
            var clone = $(event.target).clone();
            clone.removeClass(".drag_clone");
            clone.addClass(".drag");
            clone.css({ "background-color": "orange", //TODO: color of clip in viewer 
                        "width": "75px",
                        "height": "75px",
                        "minWidth": "75px",
                        "minHeight": "75px",
                        "border-radius":"8px",
                        "opacity": ".7",
                        "border":"none" });
            return clone;
        },
        revert: "invalid",
    });

    $( "#drag-x").droppable({
            accept: ".drag_clone",
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
                console.log("DROPEED");
                //TODO: make it the color of the clip being dragged in 
                var color="#"+Math.floor((Math.random()*7216)+15770000).toString(16); // lol
                $("#drag-x").append('<div id="drag'+10+'" class="drag clip" style="background-color:'+color+'"> ADDED </div>');
            }

    }); 
});
