const events = {
  "2025-10-03": [
    { type: "red", name: "Föreställning: Hamlet" },
    { type: "blue", name: "Repetition med nya medlemmar" }
  ],
  "2025-10-08": [
    { type: "yellow", name: "Medlemsmöte" }
  ],
  "2025-10-20": [
    { type: "red", name: "Premiär – The Lost Voices" }
  ]
};

const calendar = document.getElementById("calendar");
const modal = document.getElementById("event-modal");
const closeModal = document.querySelector(".close");
const eventDate = document.getElementById("event-date");
const eventList = document.getElementById("event-list");

function generateCalendar(year, month) {
  calendar.innerHTML = "";
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay.getDay(); i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0];
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.innerHTML = `<div class="day-number">${day}</div>`;

    const eventContainer = document.createElement("div");
    eventContainer.classList.add("event-dots");

    if (events[dateString]) {
      events[dateString].forEach(ev => {
        const dot = document.createElement("div");
        dot.classList.add("event-dot", ev.type);
        eventContainer.appendChild(dot);
      });
      dayDiv.addEventListener("click", () => openModal(dateString));
    }

    dayDiv.appendChild(eventContainer);
    calendar.appendChild(dayDiv);
  }
}

function openModal(dateString) {
  eventDate.textContent = dateString;
  eventList.innerHTML = "";
  events[dateString].forEach(ev => {
    const li = document.createElement("li");
    li.textContent = ev.name;
    eventList.appendChild(li);
  });
  modal.style.display = "block";
}

closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

const today = new Date();
generateCalendar(today.getFullYear(), today.getMonth());
