"use client";

import React, { useState } from "react";
import { CalEvent, CalViewType } from "./types";
import { CAL_EVENTS, SEP_CELLS, WEEK_DAYS } from "./constants";
import { CalendarHeader } from "./calendar-header";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { DayView } from "./day-view";
import { AgendaView } from "./agenda-view";
import { EventPopover } from "./event-popover";
import { NewEventForm } from "./new-event-form";

export interface CalendarWorkspaceProps {
  initialEvents?: CalEvent[];
  onBack?: () => void;
}

export function CalendarWorkspace({ initialEvents = CAL_EVENTS, onBack }: CalendarWorkspaceProps) {
  const [calView, setCalView] = useState<CalViewType>("week");
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [selectedEv, setSelectedEv] = useState<CalEvent | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [periodOffset, setPeriodOffset] = useState(0);

  const handleToggleEv = (ev: CalEvent) => {
    setSelectedEv((prev) => (prev?.id === ev.id ? null : ev));
  };

  const handleCreateEvent = (newEventData: Partial<CalEvent>) => {
    const created: CalEvent = {
      id: Date.now(),
      title: newEventData.title || "Untitled event",
      day: newEventData.day ?? 3,
      startH: newEventData.startH ?? 9.0,
      endH: newEventData.endH ?? 10.0,
      type: newEventData.type ?? "meeting",
      location: newEventData.location,
      attendees: newEventData.attendees,
      description: newEventData.description,
    };

    setEvents((prev) => [...prev, created]);
    setSelectedEv(created);
  };

  const handleDeleteEvent = (ev: CalEvent) => {
    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    if (selectedEv?.id === ev.id) {
      setSelectedEv(null);
    }
  };

  const getPeriodTitle = () => {
    if (periodOffset === 0) {
      if (calView === "week") return "Aug 31 – Sep 6, 2026";
      if (calView === "day") return "Thursday, Sep 3";
      return "September 2026";
    }
    return calView === "week"
      ? `Week (${periodOffset > 0 ? `+${periodOffset}` : periodOffset})`
      : `September 2026 (${periodOffset > 0 ? `+${periodOffset}` : periodOffset})`;
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        background: "#FDFCF8",
        animation: "fadeSlideIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
        @keyframes popIn { from { opacity:0; transform:scale(0.96) translateY(-4px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>

      {/* Calendar Header with Controls */}
      <CalendarHeader
        calView={calView}
        onViewChange={(view) => {
          setCalView(view);
          setSelectedEv(null);
        }}
        onPrev={() => setPeriodOffset((prev) => prev - 1)}
        onNext={() => setPeriodOffset((prev) => prev + 1)}
        onToday={() => setPeriodOffset(0)}
        onNewEvent={() => setShowNew(true)}
        periodTitle={getPeriodTitle()}
      />

      {/* Dynamic Views */}
      {calView === "week" && (
        <WeekView
          events={events}
          selectedEventId={selectedEv?.id}
          onSelectEvent={handleToggleEv}
          weekDays={WEEK_DAYS}
        />
      )}

      {calView === "month" && (
        <MonthView
          cells={SEP_CELLS}
          onSelectDate={() => setCalView("day")}
        />
      )}

      {calView === "day" && (
        <DayView
          events={events}
          selectedEventId={selectedEv?.id}
          onSelectEvent={handleToggleEv}
          dayNum={3}
          dayLabel="Thu"
        />
      )}

      {calView === "agenda" && (
        <AgendaView
          events={events}
          selectedEventId={selectedEv?.id}
          onSelectEvent={handleToggleEv}
          weekDays={WEEK_DAYS}
        />
      )}

      {/* Overlays: Event Popover & New Event Modal */}
      {selectedEv && (
        <EventPopover
          event={selectedEv}
          onClose={() => setSelectedEv(null)}
          onDelete={handleDeleteEvent}
        />
      )}

      {showNew && (
        <NewEventForm
          onClose={() => setShowNew(false)}
          onCreateEvent={handleCreateEvent}
        />
      )}
    </div>
  );
}
