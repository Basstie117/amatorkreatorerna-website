// === AmatörKreatörerna Calendar Script ===
// Fetches events from Google Calendar and colors them by keyword

const CALENDAR_ID = encodeURIComponent("97d03342ebc889cac9c2b8aea1967a939f035aa81596db26ac7a7f56ac1ef1e2@group.calendar.google.com");
const API_KEY = "AIzaSyBubEWvDPBb5lgZ0fruPRW7cTtUhqT1SjQ";

// Keyword color mapping
const keywordColors = {
  "föreställning": "#dc2127", // Tomato
  "kurs": "#fbd75b",          // Banana
  "möte": "#46d6db",          // Peacock
  "träff": "#51b749",         // Basil
};

let events = {};
let currentDate = new Date();

// Load events from Google Calendar
async function loadEvents() {
  const timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  const timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Google API error:", data.error.message);
      return;
    }

    events = {};
    data.items.forEach(event => {
      const date = event.start.date || event.start.dateTime.split("T")[0];
      if (!events[date]) events[date] = [];

      const name = event.summary ? event.summary.toLowerCase() : "";
      let color = "#c7b299"; // default beige tone

      // Assign color based on keyword
      for (const keyword in keywordColors) {
        if (name.includes(keyword)) {
          color = keywordColors[keyword];
          break;
        }
      }

      events[date].push({
        name: event.summary || "Okänt evenemang",
        color,
      });
    });

    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  } catch (error) {
    console.error("Network or fetch error:", error);
  }
}

// Generate the visual calendar
function generateCalendar(year, month) {
  const calendarBody = document.getElementById("calendar-body");
  const monthYear = document.getElementById("month-year");
  calendarBody.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday

  // Month name in Swedish
  const monthNames = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
  ];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  // Create blank slots for the start of the month
  for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
    const blank = document.createElement("div");
    blank.classList.add("day", "empty");
    calendarBody.appendChild(blank);
  }

  // Create days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    const label = document.createElement("div");
    label.classList.add("date");
    label.textContent = day;
    dayDiv.appendChild(label);

    // Add event dots
    if (events[dateStr]) {
      const dotsContainer = document.createElement("div");
      dotsContainer.classList.add("dots");
      events[dateStr].forEach(e => {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dot.style.backgroundColor = e.color;
        dotsContainer.appendChild(dot);
      });
      dayDiv.appendChild(dotsContainer);

      // Popup on click
      dayDiv.addEventListener("click", () => showPopup(dateStr));
    }

    calendarBody.appendChild(dayDiv);
  }
}

// Popup showing events for selected day
function showPopup(dateStr) {
  const popup = document.getElementById("eventPopup");
  const popupContent = document.querySelector(".popup-content");
  const popupBody = document.getElementById("popup-body");

  popupBody.innerHTML = "";
  events[dateStr].forEach(e => {
    const eventDiv = document.createElement("div");
    eventDiv.classList.add("popup-event");
    eventDiv.style.borderLeft = `5px solid ${e.color}`;
    eventDiv.textContent = e.name;
    popupBody.appendChild(eventDiv);
  });

  popup.classList.remove("hidden");

  // Close popup when clicking outside
  popup.addEventListener("click", (event) => {
    if (!popupContent.contains(event.target)) {
      popup.classList.add("hidden");
    }
  });
}

// Navigation
document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  loadEvents();
});
document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  loadEvents();
});
document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("eventPopup").classList.add("hidden");
});

loadEvents();
