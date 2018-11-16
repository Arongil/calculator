function playVideo(link, title) {
  var popup = document.getElementById("video-popup"),
      titleElement = document.getElementById("video-title"),
      player = document.getElementById("video-player"),
      greyout = document.getElementById("greyout"),
      body = document.getElementsByTagName("body")[0];
  body.style.overflow = "hidden";
  body.style.position = "relative";
  greyout.style.display = "initial";
  popup.style.display = "initial";
  titleElement.textContent = title;
  player.src = "https://www.youtube.com/embed/" + link;
}
function exitVideo() {
  var popup = document.getElementById("video-popup"),
      player = document.getElementById("video-player"),
      greyout = document.getElementById("greyout"),
      body = document.getElementsByTagName("body")[0];
  body.style.overflow = "initial";
  body.style.position = "static";
  greyout.style.display = "none";
  popup.style.display = "none";
  player.src = "";
}

/*

var subjects = document.getElementById("subjects"),
    subjectDropdown = document.getElementById("subject-dropdown");

for (var i = 0, j, k, subject, header, topics, topic, topicDiv, videoList, video, link, br; i < data.length; i++) {
  subjectData = data[i];
  // Add subject to the dropdown.
  dropdownLink = document.createElement("a");
  dropdownLink.href = "#" + subjectData.subjectLink;
  dropdownLink.textContent = subjectData.class;
  subjectDropdown.appendChild(dropdownLink);
  // Create subject's div.
  element = document.createElement("div");
  element.id = subjectData.subjectLink;
  element.className = "block";
  element.style.backgroundColor = subjectData.color + "60";
  // Create subject's content.
  header = document.createElement("h2");
  header.className = "block-header";
  header.textContent = subjectData.class;
  element.appendChild(header);
  // Populate content with topics.
  topics = document.createElement("ul");
  topics.class = "topics";
  for (j = 0; j < subjectData.topics.length; j++) {
    topic = subjectData.topics[j];
    topicDiv = document.createElement("div");
    header = document.createElement("h4");
    header.className = "topic-header";
    header.textContent = topic.topic;
    topicDiv.appendChild(header);
    // Populate topics with videos.
    videoList = document.createElement("ul");
    for (k = 0; k < topic.videos.length; k++) {
      video = topic.videos[k];
      link = document.createElement("a");
      link.className = "video-link";
      link.textContent = video.title;
      link.href = "javascript:void(0)";
      if (video.link.indexOf("https://www.youtube.com") !== -1) {
        // The lambda function ensures that passing the parameter doesn't call the function. Splitting after the ? and before the & in youtube.com/watch? ... & ... takes only the video ID.
        link.setAttribute("onclick", 'playVideo("' + video.link.split("?v=")[1].split("&")[0] + '", "' + (topic.topic + " | " + video.title) + '")');
      }
      else { // The video could be a link to a document outside of YouTube.
        link.href = video.link;
      }
      videoList.appendChild(link);
      if (k < topic.videos.length - 1) {
        br = document.createElement("br");
        videoList.appendChild(br);
      }
    }
    topicDiv.appendChild(videoList);
    topics.appendChild(topicDiv);
  }
  element.appendChild(topics);
  subjects.appendChild(element);
}

*/
