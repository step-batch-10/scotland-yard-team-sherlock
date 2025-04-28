const showPopUp = () => {
  const aboutBtn = document.getElementById("aboutBtn");

  const popup = document.getElementById("popup");

  aboutBtn.addEventListener("click", () => {
    popup.style.display = "flex";
  });
};

const hidePopUp = () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("close");

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  globalThis.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
};

const showJoinForm = () => {
  const joinForm = document.getElementById("join-popup-wrap");
  joinForm.style.display = "flex";
};

const closeJoinForm = () => {
  const joinForm = document.getElementById("join-popup-wrap");
  joinForm.style.display = "none";
};

const displayInvalidRoomId = (error) => {
  const form = document.getElementById("join-form");
  const ptag = document.createElement("p");
  ptag.textContent = error;
  form.appendChild(ptag);
  setTimeout(() => {
    ptag.remove();
  }, 3000);
};

const joinPlayer = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch("/lobby/room/join", { method: "POST", body: fd });

  if (res.status === 302) {
    const { location } = await res.json();
    return (globalThis.location.href = location);
  }

  const { error } = await res.json();
  displayInvalidRoomId(error);
};

const handleJoinButton = () => {
  const join = document.getElementById("join");
  const joinForm = document.getElementById("join-form");
  const closeButton = document.querySelector("#join-form-close-button");

  join.addEventListener("click", showJoinForm);
  joinForm.addEventListener("submit", joinPlayer);
  closeButton.addEventListener("click", closeJoinForm);
};

const main = () => {
  showPopUp();
  hidePopUp();
  handleJoinButton();
};

globalThis.onload = main;
