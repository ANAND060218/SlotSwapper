import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/en";

interface Event {
  id: string;
  title: string;
  date: string; // ISO format
  time: string;
  description?: string;
}

const MyCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Morning Shift",
      date: dayjs().format("YYYY-MM-DD"),
      time: "09:00 AM - 01:00 PM",
      description: "Regular work schedule",
    },
    {
      id: "2",
      title: "Evening Shift",
      date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      time: "05:00 PM - 09:00 PM",
      description: "Extra hours for client project",
    },
  ]);

  const daysInMonth = selectedDate.daysInMonth();
  const startOfMonth = selectedDate.startOf("month").day();
  const today = dayjs().format("YYYY-MM-DD");

  const handlePrevMonth = () => setSelectedDate(selectedDate.subtract(1, "month"));
  const handleNextMonth = () => setSelectedDate(selectedDate.add(1, "month"));

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const current = selectedDate.date(d);
      const dateStr = current.format("YYYY-MM-DD");
      const dayEvents = events.filter((e) => e.date === dateStr);

      days.push(
        <div
          key={dateStr}
          className={`h-24 p-2 border rounded cursor-pointer transition hover:bg-blue-50 ${
            dateStr === today ? "bg-blue-100 border-blue-400" : "bg-white"
          }`}
        >
          <div className="text-right text-sm font-semibold">{d}</div>
          <div className="text-xs mt-1 space-y-1">
            {dayEvents.map((ev) => (
              <div key={ev.id} className="truncate bg-blue-500 text-white rounded px-1 py-0.5">
                {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 My Calendar</h1>
      <div className="flex justify-between mb-4 items-center">
        <button className="btn-sm" onClick={handlePrevMonth}>
          ← Prev
        </button>
        <h2 className="text-xl font-semibold">{selectedDate.format("MMMM YYYY")}</h2>
        <button className="btn-sm" onClick={handleNextMonth}>
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center font-medium mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Event Details</h2>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No events scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="p-2 border rounded bg-white">
                <div className="font-semibold text-blue-600">{event.title}</div>
                <div className="text-sm">
                  {event.date} — {event.time}
                </div>
                {event.description && <p className="text-gray-600 text-sm mt-1">{event.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyCalendar;
