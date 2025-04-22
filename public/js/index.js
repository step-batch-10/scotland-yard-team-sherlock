const showPopUp = () => {
  const settingsBtn = document.getElementById("aboutBtn");
  const popup = document.getElementById("popup");

  settingsBtn.addEventListener("click", () => {
    popup.style.display = "flex";
  });
};

const hidePopUp = () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.querySelector(".close");

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  globalThis.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
};

const showJoinForm = (_e) => {
  const joinForm = document.getElementById("join-popup");
  joinForm.style.display = "flex";
};

const joinPlayer = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const _res = await fetch("/lobby/room/join", { method: "POST", body: fd });
};

const handleJoinButton = () => {
  const join = document.getElementById("join");
  join.addEventListener("click", showJoinForm);
  const joinForm = document.getElementById("join-form");
  joinForm.addEventListener("submit", joinPlayer);
};

const main = () => {
  showPopUp();
  hidePopUp();
  handleJoinButton();
};

globalThis.onload = main;
