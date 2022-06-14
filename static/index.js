const onCommentSubmit = () => {
  console.log("asd")
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

window.onload = async () => {
  const userData = localStorage.getItem("userData");
  if (!userData) {
    const userData = await generateUserData();
    localStorage.setItem("userData", userData)
  }
}