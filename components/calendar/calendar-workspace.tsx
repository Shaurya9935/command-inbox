"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { CalEvent, CalViewType, EventType } from "./types";
import { EV_S, GRID_START } from "./constants";
import {
  today,
  nowHour,
  mondayOf,
  addDays,
  buildWeekDays,
  buildMonthCells,
  weekTitle,
  dayTitle,
  monthTitle,
  isSameDay,
  parseEventDate,
  getEventDateKeys,
} from "./date-utils";
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

export function CalendarWorkspace({ initialEvents = [], onBack }: CalendarWorkspaceProps) {
  const [calView, setCalView] = useState<CalViewType>("week");
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [selectedEv, setSelectedEv] = useState<CalEvent | null>(null);
  const [showNew, setShowNew] = useState(false);

  // periodOffset: number of weeks/months/days offset from today
  const [periodOffset, setPeriodOffset] = useState(0);

  // Live "now" — refreshed every minute so the time marker moves
  const [nowH, setNowH] = useState(nowHour());
  const nowRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    nowRef.current = setInterval(() => setNowH(nowHour()), 60_000);
    return () => { if (nowRef.current) clearInterval(nowRef.current); };
  }, []);

  // Sync events when parent provides updated data
  useEffect(() => {
    if (initialEvents) setEvents(initialEvents);
  }, [initialEvents]);

  // ── Anchor date: the "primary" date for the current view ──────────────────
  const anchorDate = useMemo<Date>(() => {
    const t = today();
    if (calView === "week") {
      return addDays(mondayOf(t), periodOffset * 7);
    } else if (calView === "month") {
      const d = new Date(t.getFullYear(), t.getMonth() + periodOffset, 1);
      return d;
    } else {
      // day / agenda: offset by individual days
      return addDays(t, periodOffset);
    }
  }, [calView, periodOffset]);

  // Reset offset when switching views
  const handleViewChange = (view: CalViewType) => {
    setCalView(view);
    setPeriodOffset(0);
    setSelectedEv(null);
  };

  // ── Week-view derived data ─────────────────────────────────────────────────
  const todayDate = useMemo(() => today(), []);
  const weekDays = useMemo(
    () => (calView === "week" || calView === "agenda") ? buildWeekDays(anchorDate, todayDate) : [],
    [calView, anchorDate, todayDate]
  );

  // ── Month-view derived data ────────────────────────────────────────────────
  const monthCells = useMemo(
    () => calView === "month" ? buildMonthCells(anchorDate.getFullYear(), anchorDate.getMonth(), todayDate) : [],
    [calView, anchorDate, todayDate]
  );

  // Map events to date cell keys for the month view
  const monthEvents = useMemo(() => {
    if (calView !== "month") return {};
    const map: Record<string, { title: string; type: EventType; raw: CalEvent }[]> = {};
    for (const ev of events) {
      if (!ev.startDateIso) continue;
      const keys = getEventDateKeys(ev.startDateIso, ev.endDateIso);
      for (const k of keys) {
        if (!map[k]) map[k] = [];
        map[k].push({
          title: ev.title,
          type: ev.type,
          raw: ev,
        });
      }
    }
    return map;
  }, [calView, events]);

  // ── Period title ──────────────────────────────────────────────────────────
  const periodTitle = useMemo(() => {
    if (calView === "week") return weekTitle(anchorDate);
    if (calView === "month") return monthTitle(anchorDate);
    if (calView === "day" || calView === "agenda") return dayTitle(anchorDate);
    return "";
  }, [calView, anchorDate]);

  // ── Filter events for the current period ─────────────────────────────────
  // Events store `day` as 0=Mon…6=Sun *within the displayed week*.
  // We need to re-map from absolute ISO dates stored in the original API data.
  // Since CalEvent only carries `day` (relative index), we derive which actual
  // calendar date each event falls on by comparing to the week's Monday.
  // For week/agenda: filter events that fall within Mon..Sun of `anchorDate`
  // For day: filter events that fall on `anchorDate`
  // For month: no time-grid filtering (month view uses its own event map)
  const filteredEvents = useMemo((): CalEvent[] => {
    if (calView === "month") return events;

    if (calView === "week" || calView === "agenda") {
      const monday = anchorDate;
      // Use local date components for the boundary — avoids timezone midnight issues
      const monYear = monday.getFullYear();
      const monMonth = monday.getMonth();
      const monDay = monday.getDate();
      const sunday = addDays(monday, 6);
      const sunYear = sunday.getFullYear();
      const sunMonth = sunday.getMonth();
      const sunDay = sunday.getDate();

      return events
        .filter((e) => {
          if (!e.startDateIso) return false; // no date info → hide
          // Parse the event date in local time
          // dateTime strings include timezone offset; date-only strings need local parse
          const evDate = parseEventDate(e.startDateIso);
          const y = evDate.getFullYear(), m = evDate.getMonth(), d = evDate.getDate();
          // Check if evDate falls within [monday..sunday] inclusive (local date comparison)
          const afterMon = y > monYear || (y === monYear && (m > monMonth || (m === monMonth && d >= monDay)));
          const beforeSun = y < sunYear || (y === sunYear && (m < sunMonth || (m === sunMonth && d <= sunDay)));
          return afterMon && beforeSun;
        })
        .map((e) => {
          if (e.startDateIso) {
            const evDate = parseEventDate(e.startDateIso);
            const monFirstIdx = (evDate.getDay() + 6) % 7;
            return { ...e, day: monFirstIdx };
          }
          return e;
        });
    }

    if (calView === "day") {
      return events.filter((e) => {
        if (!e.startDateIso) return false;
        const evDate = parseEventDate(e.startDateIso);
        return isSameDay(evDate, anchorDate);
      });
    }

    return events;
  }, [calView, events, anchorDate]);

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleToggleEv = (ev: CalEvent) => {
    setSelectedEv((prev) => (prev?.id === ev.id ? null : ev));
  };

  const handleCreateEvent = (newEventData: Partial<CalEvent>) => {
    const dayIdx = calView === "day"
      ? (anchorDate.getDay() + 6) % 7
      : (todayDate.getDay() + 6) % 7;

    const evDate = calView === "day"
      ? anchorDate
      : calView === "week"
      ? addDays(anchorDate, newEventData.day ?? dayIdx)
      : todayDate;

    const startH = newEventData.startH ?? 9.0;
    const endH = newEventData.endH ?? 10.0;
    const startHour = Math.floor(startH);
    const startMin = Math.round((startH % 1) * 60);
    const endHour = Math.floor(endH);
    const endMin = Math.round((endH % 1) * 60);

    const startD = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate(), startHour, startMin);
    const endD = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate(), endHour, endMin);

    const created: CalEvent = {
      id: Date.now(),
      title: newEventData.title || "Untitled event",
      day: newEventData.day ?? dayIdx,
      startH,
      endH,
      type: newEventData.type ?? "meeting",
      location: newEventData.location,
      attendees: newEventData.attendees,
      description: newEventData.description,
      startDateIso: startD.toISOString(),
      endDateIso: endD.toISOString(),
    };
    setEvents((prev) => [...prev, created]);
    setSelectedEv(created);
  };

  const handleDeleteEvent = (ev: CalEvent) => {
    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    if (selectedEv?.id === ev.id) setSelectedEv(null);
  };

  // Day view props
  const dayViewDate = calView === "day" ? anchorDate : todayDate;
  const dayLabel = weekDays.length
    ? weekDays[(anchorDate.getDay() + 6) % 7]?.label
    : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][(anchorDate.getDay() + 6) % 7];

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
        onViewChange={handleViewChange}
        onPrev={() => setPeriodOffset((prev) => prev - 1)}
        onNext={() => setPeriodOffset((prev) => prev + 1)}
        onToday={() => setPeriodOffset(0)}
        onNewEvent={() => setShowNew(true)}
        periodTitle={periodTitle}
      />

      {/* Dynamic Views */}
      {calView === "week" && (
        <WeekView
          events={filteredEvents}
          selectedEventId={selectedEv?.id}
          onSelectEvent={handleToggleEv}
          weekDays={weekDays}
          nowH={nowH}
        />
      )}

      {calView === "month" && (
        <MonthView
          cells={monthCells}
          monthEvents={monthEvents}
          onSelectEvent={handleToggleEv}
          onSelectDate={(dateKey, fullDate) => {
            // Navigate to day view on that date
            if (fullDate) {
              const t = today();
              const diffDays = Math.round((fullDate.getTime() - t.getTime()) / 86400000);
              setPeriodOffset(diffDays);
            }
            setCalView("day");
          }}
        />
      )}

      {calView === "day" && (
        <DayView
          events={filteredEvents}
          selectedEventId={selectedEv?.id}
          onSelectEvent={handleToggleEv}
          viewDate={dayViewDate}
          nowH={nowH}
        />
      )}

      {calView === "agenda" && (
        <AgendaView
          events={filteredEvents}
          selectedEventId={selectedEv?.id}
          onSelectEvent={handleToggleEv}
          weekDays={weekDays}
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
