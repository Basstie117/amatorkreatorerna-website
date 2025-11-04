
const CALENDAR_ID = encodeURIComponent("amatorkreatorerna@gmail.com");
const API_KEY = "AIzaSyBubEWvDPBb5lgZ0fruPRW7cTtUhqT1SjQ";

let events = {};

async function loadEvents() {
  try {
    const timeMin = new Date().toISOString();
    const timeMax = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Google API returned " + response.status);

    const data = await response.json();
    console.log("Calendar data:", data);

    if (data.items) {
      data.items.forEach(event => {
        const date = event.start.date || event.start.dateTime.split("T")[0];
        if (!events[date]) events[date] = [];

        // Use Google’s event color if available
        const color = event.colorId || "7";
        events[date].push({ color, name: event.summary });
      });
    }

    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  } catch (err) {
    console.error("Calendar load error:", err);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  }
}

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("month-year");
const modal = document.getElementById("event-modal");
const closeModal = document.querySelector(".close");
const eventDate = document.getElementById("event-date");
const eventList = document.getElementById("event-list");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

let currentDate = new Date();

function generateCalendar(year, month) {
  calendar.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = firstDay.toLocaleString("sv-SE", { month: "long" });
  monthYear.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

  // Offset for first day (Sunday = 0)
  for (let i = 0; i < firstDay.getDay(); i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  // Add each day
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

// Modal Handling
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

// Navigation
prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

// Init
loadEvents();
