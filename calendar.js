
const CALENDAR_ID = encodeURIComponent("amatorkreatorerna@gmail.com");
const API_KEY = "AIzaSyBubEWvDPBb5lgZ0fruPRW7cTtUhqT1SjQ";

let currentDate = new Date();
let events = {};

let colorMap = {};

async function loadColors() {
  const url = `https://www.googleapis.com/calendar/v3/colors?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  colorMap = data.event || {};
}

async function loadEvents() {
  try {
    await loadColors(); // ✅ load Google’s color palette first
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

        // Use the event color, or fallback to calendar default
        const colorId = event.colorId || "7";
        const color = colorMap[colorId]?.background || "#ccc";

        events[date].push({ name: event.summary, color });
      });
    }

    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  } catch (err) {
    console.error("Calendar load error:", err);
  }
}

function generateCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("monthYear");
  calendar.innerHTML = "";

  const monthNames = ["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  for (let i = 0; i < adjustedFirst; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.innerHTML = `<span class="date">${d}</span>`;

    if (events[dateString]) {
      const dots = document.createElement("div");
      dots.classList.add("dots");
      events[dateString].forEach(ev => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.style.backgroundColor = getEventColor(ev.color);
        dots.appendChild(dot);
      });
      dayDiv.appendChild(dots);
      dayDiv.addEventListener("click", () => showPopup(dateString));
    }

    calendar.appendChild(dayDiv);
  }
}

function getEventColor(colorId) {
  const googleColors = {
    "1": "#a4bdfc", "2": "#7ae7bf", "3": "#dbadff",
    "4": "#ff887c", "5": "#fbd75b", "6": "#ffb878",
    "7": "#46d6db", "8": "#e1e1e1", "9": "#5484ed",
    "10": "#51b749", "11": "#dc2127"
  };
  return googleColors[colorId] || "#ccc";
}

function showPopup(date) {
  const popup = document.getElementById("eventPopup");
  const list = document.getElementById("eventList");
  const popupDate = document.getElementById("popupDate");
  list.innerHTML = "";
  popupDate.textContent = date;

  events[date].forEach(ev => {
    const li = document.createElement("li");
    li.textContent = ev.name;
    list.appendChild(li);
  });

  popup.classList.remove("hidden");
}

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("eventPopup").classList.add("hidden");
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

loadEvents();
