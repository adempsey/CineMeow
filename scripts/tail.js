//Backend code for server / database
var projects = [];
var maxClipsStackSize = 10;

//Project Data Structure

//Add clips to project clips stack
function updateProject(clips_data_JSON){
	var clips_data = JSON.parse(jsonString);
	projects[clips_data.project_id].clips_stack.unshift(clips_data.clips);
	if(projects[clips_data.project_id].clips_stack.length > maxClipsStackSize){
		projects[clips_data.project_id].clips_stack.pop();
	}
}