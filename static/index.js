window.commentData = null

const onCommentSubmit = async () => {
  const inputElement = document.querySelector('.commentInput')
  const userData = JSON.parse(localStorage.getItem("userData"));

  const data = {
    name: `${userData.name.first} ${userData.name.last}`,
    thumbnail: userData.picture.thumbnail,
    timestamp: new Date().getTime() + "",
    commentText: inputElement.value,
  };

  try {
    const response = await fetch('/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (json?.status === 'SUCCESS') {
      loadComments();
      inputElement.value = "";
    } else {
      throw new Error()
    }
  } catch (e) {
    alert("Can't submit comment");
  }

}

const onUpvoteClick = async (commentId) => {
  const userData = JSON.parse(localStorage.getItem("userData"));

  const data = {
    commentId,
    userId: userData.login.uuid,
  };

  try {
    const response = await fetch('/upvote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (json?.status === 'SUCCESS') {
      loadComments();
    } else {
      throw new Error()
    }
  } catch (e) {
    alert("Can't submit comment");
  }
}

const generateUserData = async () => {
  try {
    const res = await fetch("https://randomuser.me/api/");
    const data = await res.json();
    console.log(data);
    if (data && data.results && data.results[0]) {
      return data.results[0];
    } else {
      throw new Error();
    }
    
  } catch (e) {
    alert("Can't retrieve user data");
  }
}

const getComments = async () => {
  try {
    const res = await fetch("/comments");
    const data = await res.json();
    if (data && data.comments) {
      return data.comments;
    } else {
      throw new Error();
    }
  } catch (e) {
    alert("Can't retrieve comment data");
    return {};
  }
}

// From https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
var getRelativeTime = (d1, d2 = new Date()) => {
  const units = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  }

  var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  var elapsed = d1 - d2

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (var u in units)
    if (Math.abs(elapsed) > units[u] || u == 'second') 
      return rtf.format(Math.round(elapsed/units[u]), u)
}

const commentTemplate = (id, imageUrl, userName, timestamp, text, upvoters) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const isUpvoted = upvoters.find(upvoter => upvoter === userData.login.uuid);
  
  return `
    <div class="comment">
      <img class="thumbnail" src="${imageUrl}" alt="Your image">
      <div class="commentTextWrapper">
        <span class="commentName">${userName} <span class="commentTimestamp">・ ${getRelativeTime(+new Date(parseInt(timestamp)))}</span></span>
        <div class="commentText">${text}</div>
        <div class="commentButtons">
          <button class="commentButton ${isUpvoted ? 'upvoted' : ''}" onclick="onUpvoteClick('${id}')">▲ Upvote</button>
          <button class="commentButton">Reply</button>
          ${upvoters.length !== 0
            ? `<span class="upvoteCounter">${upvoters.length} upvotes</span>`
            : ''
          }
        </div>
      </div>
    </div>
  `
}

const renderComments = () => {
  if (window.commentData === null) {
    return // TODO: Could add a spinner render instead of starting
  }

  if (window.commentData.length === 0) {
    return // TODO: Render some "No comments yet stuff"
  }

  const commentsElement = document.querySelector('.comments')
  console.log(window.commentData)
  commentsElement.innerHTML = window.commentData
    .map(comment => 
      commentTemplate(
        comment.id,
        comment.user.thumbnail,
        comment.user.name,
        comment.timestamp,
        comment.text,
        comment.upvoters.filter(id => id !== '')
      )
    )
    .join("")

}

const loadComments = async () => {
  window.commentData = await getComments()
  renderComments()
}

const renderUserLine = (thumbnail) => {
  const thumbnailElement = document.querySelector('.userLine .thumbnail')
  thumbnailElement.setAttribute('src', thumbnail)
}

window.onload = async () => {
  let userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData) {
    userData = await generateUserData();
    localStorage.setItem("userData", JSON.stringify(userData))
  }

  renderUserLine(userData.picture.thumbnail)
  loadComments()
}