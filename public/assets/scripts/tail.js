//Backend code for server / database
var projects = [];
var maxClipsStackSize = 10;

var project_id_itter = 0; //Should be updated by a file?
var source_video_id_itter = 0; // Should be updated by a file?

//Project Data Structure
var project_ex = new Object();
project_ex.clips_stack = []; //time signature collections
project_ex.clips_redo_stack = [];
projext_ex.project_id = "some id";
project_ex.video_clips = []; //actual videos

function createNewProject(){
	var newProject = new Object();
	newProject.clips_stack = [];
	newProject.clips_redo_stack = [];
	newProject.video_clips = [];
	newProject.project_id = project_id_itter;
	project_id_itter ++;
	projects.unshift(newProject);
}

function addSourceVideoToProject(project_id, videoClip){
	projects[project_id].video_clips.push({
		"video": videoClip, 
		"video_id" :source_video_id_itter,
		"video_url" : "SOME URL LELELELE"});
	source_video_id_itter ++;	
	//Return id back to client? 
	//Or manage ids another way
}

//Add clips to project clips stack
function updateProject(clips_data_JSON){
	var clips_data = JSON.parse(jsonString);
	var project = projects[clips_data.project_id];
	project.clips_stack.unshift(clips_data.clips);
	if(project.clips_stack.length > maxClipsStackSize){
		project.clips_stack.pop();
	}
}

//Undo last modifications to clips in project
function undo(project_id){
	var project = projects[project_id];
	project.clips_redo_stack.unshift(project.clips_stack.shift());
	if(project.clips_redo_stack.length > maxClipsStackSize){
		project.clips_redo_stack.pop();
	}
}

//Redo last modification to clips in project
function redo(project_id){
	var project = projects[project_id];
	project.clips_stack.unshift(project.clips_redo_stack.shift());
	if(project.clips_stack.length > maxClipsStackSize){
		project.clips_stack.pop();
	}
}

//Return current clips object in given project
function getCurrentClips(project_id){
	return projects[project_id].clips_stack[0];
}

