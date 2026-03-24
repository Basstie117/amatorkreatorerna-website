// === AmatörKreatörerna Calendar Script ===
// Fetches events from Google Calendar and colors them by keyword

const CALENDAR_ID = encodeURIComponent("97d03342ebc889cac9c2b8aea1967a939f035aa81596db26ac7a7f56ac1ef1e2@group.calendar.google.com");
const API_KEY = "AIzaSyBubEWvDPBb5lgZ0fruPRW7cTtUhqT1SjQ";

let currentDate = new Date();
let events = {};
let lastFetchTime = 0;

// Keyword color mapping
const keywordColors = {
  "föreställning": "#dc2127", // Tomato
  "kurs": "#fbd75b",          // Banana
  "möte": "#46d6db",          // Peacock
  "träff": "#51b749",         // Basil
  "projekt": "#F28500",       // Tangerine
};

async function loadEvents(force = false) {
  const now = Date.now();
  if (!force && now - lastFetchTime < 60 * 60 * 1000) {
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    return;
  }

  lastFetchTime = now;
  events = {};

  try {
    const timeMin = new Date().toISOString();
    const timeMax = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Google API returned " + response.status);

    const data = await response.json();
    if (data.items) {
      data.items.forEach(event => {
        const date = event.start.date || event.start.dateTime.split("T")[0];
        if (!events[date]) events[date] = [];

        const name = event.summary ? event.summary.toLowerCase() : "";
        let color = "#c7b299"; // default beige
        for (const keyword in keywordColors) {
          if (name.includes(keyword)) {
            color = keywordColors[keyword];
            break;
          }
        }

        // Extract time and handle both all-day and timed events
        let startTime = event.start.dateTime ? new Date(event.start.dateTime) : null;
        let endTime = event.end.dateTime ? new Date(event.end.dateTime) : null;

        const timeText = startTime && endTime
          ? `${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : "Heldag";

        events[date].push({
          name: event.summary || "(Ingen titel)",
          location: event.location || "Ingen plats angiven",
          description: event.description || "Ingen beskrivning tillgänglig",
          time: timeText,
          color: color
        });
      });
    }

    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  } catch (err) {
    console.error("Calendar load error:", err);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  }
}

// === Render the calendar ===
function generateCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("monthYear");
  calendar.innerHTML = "";

  const monthNames = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
  ];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  // Empty cells before first day
  for (let i = 0; i < adjustedFirst; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.innerHTML = `<span class="date">${d}</span>`;

    if (dateString < todayString) {
      dayDiv.classList.add("past-day");
    } else if (dateString === todayString) {
      dayDiv.classList.add("today");
    }

    if (events[dateString]) {
      const dots = document.createElement("div");
      dots.classList.add("dots");
      
      events[dateString].forEach(ev => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.style.backgroundColor = ev.color;
        dot.style.color = ev.color; // enables color-based glow via currentColor
        dots.appendChild(dot);
      });
      
      dayDiv.appendChild(dots);
      dayDiv.addEventListener("click", () => showPopup(dateString));
    }

    calendar.appendChild(dayDiv);
  }
}

// === Popup logic ===

// Converts URLs in text into clickable <a> links
function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

function showPopup(date) {
  const popup = document.getElementById("eventPopup");
  const list = document.getElementById("eventList");
  const popupDate = document.getElementById("popupDate");
  list.innerHTML = "";
  popupDate.textContent = date;

  events[date].forEach(ev => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ev.name}</strong><br>
      🕒 ${ev.time}<br>
      📍 ${ev.location}<br>
      📝 ${linkify(ev.description)}
    `;
    list.appendChild(li);
  });

  popup.classList.remove("hidden");
}

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("eventPopup").classList.add("hidden");
});

document.getElementById("eventPopup").addEventListener("click", (event) => {
  const popupContent = document.querySelector(".popup-content");
  if (!popupContent.contains(event.target)) {
    document.getElementById("eventPopup").classList.add("hidden");
  }
});

// === Month navigation ===
document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  loadEvents(true);
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  loadEvents(true);
});

// === Initial load and auto-refresh ===
loadEvents(true);
setInterval(() => loadEvents(true), 60 * 60 * 1000);
