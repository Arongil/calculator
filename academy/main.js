/*

var data = [
  {
    "class": "Differential Equations",
    "subjectLink": "differential-equations",
    "color": "#5ec9ad",
    "topics": [{
        "topic": "Verification",
        "videos": [{"title": "Introduction",
                "link": "https://www.youtube.com/watch?v=EipWGQgJyJI&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=1"},{
                "title": "Example",
                "link": "https://www.youtube.com/watch?v=tokc7hYqHRE&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=2"}]
      }, {
        "topic": "Direction Fields",
        "videos": [{"title": "Introduction",
                "link": "https://www.youtube.com/watch?v=klc5gtPSQGM&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=3"},{
                "title": "The Method of Isoclines",
                "link": "https://www.youtube.com/watch?v=zch0KuZx1aI&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=4"},{
                "title": "The Phase Line",
                "link": "https://www.youtube.com/watch?v=bHFcDVTmn6Q&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=5"}]
      }, {
        "topic": "First Order DEs: Separable",
        "videos": [{"title": "Introduction",
                "link": "https://www.youtube.com/watch?v=SZAnoeaxZEE&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=6"},{
                "title": "Example 1",
                "link": "https://www.youtube.com/watch?v=55Y3W2ePvj0&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=7"},{
                "title": "Example 2",
                "link": "https://www.youtube.com/watch?v=JKiwmvWCQQU&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=8"}]
      }, {
        "topic": "First Order DEs: Linear",
        "videos": [{"title": "Introduction",
                "link": "https://www.youtube.com/watch?v=UwLyTgV5igM&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=9"},{
                "title": "Example",
                "link": "https://www.youtube.com/watch?v=nH6Rf3WZMvs&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=10"},{
                "title": "Mixing Problem 1",
                "link": "https://www.youtube.com/watch?v=3VVbk9lFA0Q&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=11"},{
                "title": "Mixing Problem 2",
                "link": "https://www.youtube.com/watch?v=-EqfBnlhCoo&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=12"},{
                "title": "Mixing Problem 3",
                "link": "https://www.youtube.com/watch?v=49iXB30OL3s&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=13"}]
      }, {
        "topic": "First Order DEs: Exact",
        "videos": [{
                 "title": "Introduction 1",
                "link": "https://www.youtube.com/watch?v=QpZ4d_3sZ4c&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=14"},{
                "title": "Introduction 2",
                "link": "https://www.youtube.com/watch?v=De8uz5iROKk&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=15"},{
                "title": "Example 1",
                "link": "https://www.youtube.com/watch?v=BcXtc38tEDM&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=16"},{
                "title": "Example 2",
                "link": "https://www.youtube.com/watch?v=Nv48ZDCjh-c&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=17"}]
      }, {
        "topic": "Second Order DEs: Homogeneous",
        "videos": [{
                "title": "Linearity",
                "link": "https://www.youtube.com/watch?v=LHJ1gWolY70&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=18"},{
                "title": "Linear Independence",
                "link": "https://www.youtube.com/watch?v=j2QGWfqdf6k&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=19"},{
                "title": "Homogeneous Introduction",
                "link": "https://www.youtube.com/watch?v=wtg8lVAm6Ck&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=20"},{
                "title": "Characteristic Equation: Distinct Roots",
                "link": "https://www.youtube.com/watch?v=LPv9KSn6szM&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=21"},{
                "title": "Characteristic Equation: A Double Root",
                "link": "https://www.youtube.com/watch?v=wtIiyNTm5aM&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=22"},{
                "title": "Characteristic Equation: Complex Roots",
                "link": "https://www.youtube.com/watch?v=_qBANqxJ_nU&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=23"},{
                "title": "Real Roots Practice",
                "link": "https://www.youtube.com/watch?v=HupAQnp1KYs&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=24"},{
                "title": "Complex Roots Practice",
                "link": "https://www.youtube.com/watch?v=jDeLOAbQ8IY&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=25"}]
      }, {
        "topic": "The Laplace Transform",
        "videos": [{
                "title": "Introduction",
                "link": "https://www.youtube.com/watch?v=RJ3GXiVKHxo&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=26"},{
                "title": "Laplace Transform of Exponentials",
                "link": "https://www.youtube.com/watch?v=49FpUcZdZlY&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=27"},{
                "title": "Laplace Transform of Sines and Cosines",
                "link": "https://www.youtube.com/watch?v=HyrqUHOK8OQ&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=28"},{
                "title": "Laplace Transform of Polynomials",
                "link": "https://www.youtube.com/watch?v=rI7sHKQo930&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=29"},{
                "title": "Laplace Transform of a Derivative",
                "link": "https://www.youtube.com/watch?v=OjJ5SJqdcQI&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=30"},{
                "title": "The Inverse Laplace Transform",
                "link": "https://www.youtube.com/watch?v=koFWe-iSM4M&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=31"},{
                "title": "Linearity of the Inverse Laplace Transform",
                "link": "https://www.youtube.com/watch?v=JLvJZkQy6kk&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=32"},{
                "title": "Solving DEs",
                "link": "https://www.youtube.com/watch?v=QojhnJXdGOU&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=33"},{
                "title": "Solving DEs with Translations",
                "link": "https://www.youtube.com/watch?v=b_rbPWodb-s&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=34"},{
                "title": "Solving DEs with Partial Fraction Decomposition",
                "link": "https://www.youtube.com/watch?v=WKqu-0_PjiM&list=PLapqQU8bF_--sm6FERs9lbhx2hRVnLKJw&index=35"}]
      }
    ]
  },
  {
    "class": "AP Calculus Practice",
    "subjectLink": "calculus-practice",
    "color": "#d69bdb",
    "topics": [{
        "topic": "Worked AP Calculus BC Full Exams",
        "videos": [{"title": "2016 Multiple Choice (no calculator)",
                "link": "https://www.youtube.com/watch?v=fgeg5Eof5uM&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=1"},{
                "title": "2016 Multiple Choice (calculator)",
                "link": "https://www.youtube.com/watch?v=NixEjm7x0wY&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=2"},{
                "title": "2017 Free Response (calculator)",
                "link": "https://www.youtube.com/watch?v=1v2uIV11Dew&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=3"},{
                "title": "2017 Free Response (no calculator)",
                "link": "https://www.youtube.com/watch?v=L61Z8YruJp0&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=4"},{
                "title": "2013 Multiple Choice (no calculator)",
                "link": "https://www.youtube.com/watch?v=HT9_SvRNInY&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=5"},]
      }, {
        "topic": "Worked AP Calculus BC Specific Questions",
        "videos": [{"title": "2012 FRQ 5 (parts A and B)",
                "link": "https://www.youtube.com/watch?v=v2pWvLxoChs&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=6"},{
                "title": "2012 FRQ 5 (part C)",
                "link": "https://www.youtube.com/watch?v=u6dwsWYqsK8&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=7"},{
                "title": "2009 FRQ 4 (part A)",
                "link": "https://www.youtube.com/watch?v=YIVXKfY6rck&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=8"},{
                "title": "2009 FRQ 4 (parts B and C)",
                "link": "https://www.youtube.com/watch?v=qaTyJcRUOYQ&list=PLapqQU8bF_-9V-SyVxuHZ6jwa0ny7JQVp&index=9"}]
      }
    ]
  },
  {
    "class": "Trigonometry",
    "subjectLink": "trigonometry",
    "color": "#dbbb97",
    "topics": [{
        "topic": "What is Trigonometry?",
        "videos": [{"title": "Introduction",
                "link": "https://www.youtube.com/watch?v=h6Y3fI4LEeg&list=PLapqQU8bF_-_uhOIK5e3Fo6a_pb0TG0N6&index=1"},{
                "title": "Exploration",
                "link": "https://www.youtube.com/watch?v=_oWeBKmf1Fw&list=PLapqQU8bF_-_uhOIK5e3Fo6a_pb0TG0N6&index=2"},{
                "title": "Introduction and Pythagorean Identity",
                "link": "https://www.youtube.com/watch?v=iH3yDXQl5uo&list=PLapqQU8bF_-_uhOIK5e3Fo6a_pb0TG0N6&index=3"},{
                "title": "Even-Odd Identities",
                "link": "https://www.youtube.com/watch?v=Vw1vTU4VVN4&list=PLapqQU8bF_-_uhOIK5e3Fo6a_pb0TG0N6&index=4"}]
      }, {
        "topic": "Proofs of Identities",
        "videos": [{"title": "The Double Angle Identities",
                "link": "https://www.youtube.com/watch?v=b5JvVZ2o60I&list=PLapqQU8bF_-_uhOIK5e3Fo6a_pb0TG0N6&index=5"},{
                "title": "The Sum identities",
                "link": "https://www.youtube.com/watch?v=r3Zu8-sz3Sc&list=PLapqQU8bF_-_uhOIK5e3Fo6a_pb0TG0N6&index=6"},{
                "title": "Half Angle and Angle Subtraction Identities",
                "link": "https://www.youtube.com/watch?v=eHmXW4VNRP8&list=PLapqQU8bF_-_uhOIK5e3Fo6a_pb0TG0N6&index=7"}]
      }
    ]
  },
  {
    "class": "Fun",
    "subjectLink": "fun",
    "color": "#b7e09f",
    "topics": [{
        "topic": "Programs",
        "videos": [{"title": "Sandbox Game",
                "link": "hhttps://www.youtube.com/watch?v=Y0nwoa6MfbI&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=1"},{
                "title": "Gravity Crash",
                "link": "https://www.youtube.com/watch?v=CdYFsDW2-is&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=2"}]
      },{
        "topic": "Miscellaneous",
        "videos": [{"title": "Children's Book Narrated: The Magic Seed",
                "link": "https://www.youtube.com/watch?v=0C0kS2gLt9g&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=3"},{
                "title": "How do Exchange Networks Develop and Expand?",
                "link": "https://www.youtube.com/watch?v=SL-Nd28DCGo&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=7"},{
                "title": "How did Change Accelerate?",
                "link": "https://www.youtube.com/watch?v=L8tlLIk1Zls&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=14"}]
      },{
        "topic": "The Mandelbrot Set",
        "videos": [{"title": "Introduction",
                "link": "https://www.youtube.com/watch?v=cyOGd7d2CKk&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=8"},{
                "title": "Example",
                "link": "https://www.youtube.com/watch?v=gSm0XOYDnGQ&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=9"},{
                "title": "Computer-Rendered",
                "link": "https://www.youtube.com/watch?v=f1-kmS4RUoA&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=10"}]
      },{
        "topic": "The Binomial Theorem",
        "videos": [{"title": "Part 1",
                "link": "https://www.youtube.com/watch?v=CMWi3FWqkC4&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=17"},{
                "title": "Part 2",
                "link": "https://www.youtube.com/watch?v=F9NnVIhvXns&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=18"}]
      },{
        "topic": "The Best of Math",
        "videos": [{"title": "Derivation of the Sum of a Geometric Series",
                "link": "https://www.youtube.com/watch?v=gBgZ1sRCoIk&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=4"},{
                "title": "Derivation of the Quadratic Equation",
                "link": "https://www.youtube.com/watch?v=AvpFo5JQATo&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=5"},{
                "title": "Intuition for Linear Programming",
                "link": "https://www.youtube.com/watch?v=15AyPV7E64Q&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=6"},{
                "title": "The Area under the Bell Curve",
                "link": "https://www.youtube.com/watch?v=vtcf96R-h3Q&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=11"},{
                "title": "The Rotation Matrix",
                "link": "https://www.youtube.com/watch?v=gyFhrRVh2U8&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=12"},{
                "title": "How are Circumference and Area Connected?",
                "link": "https://www.youtube.com/watch?v=kcSgkfSEVoA&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=13"},{
                "title": "The Surface Area and Volume of Spheres",
                "link": "https://www.youtube.com/watch?v=dBy343OlA1Q&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=15"},{
                "title": "Projectile Motion?",
                "link": "https://www.youtube.com/watch?v=8otXp-iYKfU&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=16"},{
                "title": "Proof of the Dot Product Theorem",
                "link": "https://www.youtube.com/watch?v=PnJoKGynu_U&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=19"},{
                "title": "The Reflection Matrix",
                "link": "https://www.youtube.com/watch?v=9_1brP8t_xs&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=20"},{
                "title": "The Corner Cube Problem",
                "link": "https://www.youtube.com/watch?v=O7YoNFyW_lc&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=21"},{
                "title": "erf(x): Why 68% of Data Falls within 1 Standard Deviation",
                "link": "https://www.youtube.com/watch?v=q4gK6tQnuYM&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=22"},{
                "title": "Defining the Cross Product from Scratch",
                "link": "https://www.youtube.com/watch?v=QI2TLsRgObk&list=PLapqQU8bF_-84L3uXfRLwhnyp4pOuZ6JH&index=23"}]
      },
    ]
  }
];

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
      link.href = video.link;
      link.textContent = video.title;
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
