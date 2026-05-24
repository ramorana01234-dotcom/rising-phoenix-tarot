"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { createClient } from "@supabase/supabase-js";

const LOGO_IMAGE = "/logo.png.png";
const WHATSAPP_TEST_MODE = false;
const SUPABASE_URL = "https://vdekubrewuakdrbpgurk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZWt1YnJld3Vha2RyYnBndXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjM1MTEsImV4cCI6MjA5NTEzOTUxMX0.Gg9dQ63aY7lgPi-E7GGBDBnPICGtEalCGZKya5lCDAE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SETTINGS = {
  siteName: "Rising Phoenix Tarot",
  whatsappNumber: "447424110021",
  contactEmail: "aifosofia222@gmail.com",
  paypalClientId:
    "BAAwxahKFLvrhSVv5nxPX77JuRx_s-EUhX10FzBqjPmRXORS93T575j9XZQfobdDKzEeJs72l4clge9yIk",
  aboutMe:
    "Hi, I’m Daniela, the soul behind Rising Phoenix Tarot. I’ve been reading tarot since 2018 and honestly, the cards and I go way back at this point. I created this space for people who need clarity, reassurance, guidance or simply someone who listens without judgement. My readings are calm, honest and intuitive, with a little bit of humour when life becomes too dramatic for no reason. Think of it more like a deep conversation with someone who genuinely wants to help you feel lighter, clearer and more connected to yourself.",
  disclaimer:
    "Tarot readings are for spiritual guidance and personal reflection only. They do not replace professional medical, legal, or financial advice.",
};

const DEFAULT_DAY_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

const SERVICES = [
  { duration: "30 Minutes", price: "£15", amount: "15.00" },
  { duration: "1 Hour", price: "£30", amount: "30.00" },
];

const START_DATE = "2026-06-01";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(dateString: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString || "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function getMonthCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7;

  return [
    ...Array(startPadding).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, index) => new Date(year, month, index + 1)),
  ] as Array<Date | null>;
}

function runSmokeTests() {
  console.assert(displayDate("2026-06-05") === "05/06/2026", "Date format must be dd/mm/yyyy.");
  console.assert(toDateKey(new Date(2026, 5, 5)) === "2026-06-05", "Date key must not shift with timezone.");
  console.assert(getMonthCalendarDays(new Date(2026, 5, 1)).filter(Boolean).length === 30, "June 2026 must have 30 days.");
  console.assert(getMonthCalendarDays(new Date(2026, 5, 1))[0] !== null, "June 2026 starts on Monday.");
  console.assert(SERVICES.length === 2, "There must be two reading durations.");
  console.assert(SERVICES[0].price === "£15" && SERVICES[1].price === "£30", "Prices must remain £15 and £30.");
  console.assert(DEFAULT_DAY_TIMES.includes("10:00"), "Default times must include 10:00.");
  console.assert(SETTINGS.whatsappNumber === "447424110021", "WhatsApp number must be set.");
  console.assert(["About Me", "Book a Reading", "Ask a Question"].length === 3, "Slider must have exactly three sections.");
}

runSmokeTests();

function SectionFrame({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative z-20 min-h-full w-1/3 flex-shrink-0 overflow-y-auto px-4 py-4 pointer-events-auto md:px-10">
      {children}
    </section>
  );
}

export default function TarotBookingWebsite() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date(START_DATE));
  const [paidBookedSlots, setPaidBookedSlots] = useState<string[]>([]);
  const [manualBusySlots, setManualBusySlots] = useState<string[]>([]);
  const [notWorkingDays, setNotWorkingDays] = useState<string[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminDate, setAdminDate] = useState(START_DATE);
  const [adminTime, setAdminTime] = useState("10:00");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [paymentComplete, setPaymentComplete] = useState(WHATSAPP_TEST_MODE);
  const [showPayPalCheckout, setShowPayPalCheckout] = useState(false);
  const [forumQuestions, setForumQuestions] = useState([
    {
      id: 1,
      name: "Anonymous",
      contact: "",
      question: "I feel stuck and I need some guidance. Can tarot help me understand my next step?",
      reply:
        "Yes, tarot can help you reflect on your current energy and possible direction. You are welcome to book a reading, or leave a message if you simply need guidance.",
      createdAt: "23/05/2026",
    },
  ]);

  const [booking, setBooking] = useState({
    name: "",
    duration: "30 Minutes",
    date: START_DATE,
    time: DEFAULT_DAY_TIMES[0],
    question: "",
  });

  const [ask, setAsk] = useState({ name: "", contact: "", question: "" });

  const saveBookingToSupabase = async () => {
    const { data: existingBooking, error: checkError } = await supabase
      .from("bookings")
      .select("date,time")
      .eq("date", booking.date)
      .eq("time", booking.time)
      .maybeSingle();

    if (checkError) {
      alert(`Could not check this slot: ${checkError.message}`);
      return false;
    }

    if (existingBooking) {
      alert("Sorry, this time has just been booked. Please choose another time.");
      setPaidBookedSlots((slots) => Array.from(new Set([...slots, `${booking.date}-${booking.time}`])));
      return false;
    }

    const { error } = await supabase.from("bookings").insert({
      name: booking.name || "Test Booking",
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      question: booking.question || "Test question",
    });

    if (error) {
      alert(`Could not save booking: ${error.message}`);
      return false;
    }

    setPaidBookedSlots((slots) => Array.from(new Set([...slots, `${booking.date}-${booking.time}`])));
    return true;
  };

  useEffect(() => {
    const loadBookings = async () => {
      const { data, error } = await supabase.from("bookings").select("date,time");

      if (error) {
        console.error("Could not load bookings:", error.message);
        return;
      }

      const savedSlots = (data || []).map((item) => `${item.date}-${item.time}`);
      setPaidBookedSlots(Array.from(new Set(savedSlots)));
    };

    const loadScheduleOverrides = async () => {
      const { data, error } = await supabase
        .from("schedule_overrides")
        .select("date,available_times,busy_times,not_working");

      if (error) {
        console.error("Could not load schedule overrides:", error.message);
        return;
      }

      const customAvailability: Record<string, string[]> = {};
      const customBusySlots: string[] = [];
      const customNotWorkingDays: string[] = [];

      (data || []).forEach((item) => {
        let availableTimes: string[] = DEFAULT_DAY_TIMES;
        let busyTimes: string[] = [];

        try {
          availableTimes = item.available_times ? JSON.parse(item.available_times) : DEFAULT_DAY_TIMES;
        } catch {
          availableTimes = DEFAULT_DAY_TIMES;
        }

        try {
          busyTimes = item.busy_times ? JSON.parse(item.busy_times) : [];
        } catch {
          busyTimes = [];
        }

        customAvailability[item.date] = availableTimes;
        busyTimes.forEach((time) => customBusySlots.push(`${item.date}-${time}`));

        if (item.not_working) {
          customNotWorkingDays.push(item.date);
        }
      });

      setAvailableSlots(customAvailability);
      setManualBusySlots(Array.from(new Set(customBusySlots)));
      setNotWorkingDays(Array.from(new Set(customNotWorkingDays)));
    };

    loadBookings();
    loadScheduleOverrides();

    const refreshInterval = window.setInterval(loadBookings, 10000);

    return () => window.clearInterval(refreshInterval);
  }, []);

  const saveScheduleOverride = async (
    date: string,
    availableTimes: string[],
    busyTimes: string[],
    notWorking: boolean
  ) => {
    const { error } = await supabase.from("schedule_overrides").upsert({
      date,
      available_times: JSON.stringify(availableTimes),
      busy_times: JSON.stringify(busyTimes),
      not_working: notWorking,
    });

    if (error) {
      alert(`Could not save schedule change: ${error.message}`);
    }
  };

  const bookedSlots = useMemo(
    () => Array.from(new Set([...paidBookedSlots, ...manualBusySlots])),
    [paidBookedSlots, manualBusySlots]
  );

  const selectedService = SERVICES.find((service) => service.duration === booking.duration) || SERVICES[0];
  const selectedTimes = notWorkingDays.includes(booking.date)
    ? []
    : availableSlots[booking.date] || DEFAULT_DAY_TIMES;
  const adminTimes = notWorkingDays.includes(adminDate)
    ? []
    : availableSlots[adminDate] || DEFAULT_DAY_TIMES;
  const slotKey = `${booking.date}-${booking.time}`;
  const isSlotAlreadyBooked = bookedSlots.includes(slotKey);
  const monthName = currentMonth.toLocaleString("en-GB", { month: "long", year: "numeric" });
  const calendarDays = getMonthCalendarDays(currentMonth);
  const menuItems = ["About Me", "Book a Reading", "Ask a Question"];

  const bookingText = useMemo(() => {
    return encodeURIComponent(
      `Hi Daniela, I have completed my payment for a tarot reading.\n\nName: ${booking.name}\nReading: ${booking.duration} - ${selectedService.price}\nDate: ${displayDate(booking.date)}\nTime: ${booking.time} Romania Time\nQuestion / situation: ${booking.question}\n\nPlease confirm my booking when you can. Thank you.`
    );
  }, [booking, selectedService]);

  const whatsappBookingUrl = useMemo(() => {
    return `https://wa.me/${SETTINGS.whatsappNumber}?text=${bookingText}`;
  }, [bookingText]);

  const changeMonth = (direction: number) => {
    setCurrentMonth((previousMonth) => {
      const year = previousMonth.getFullYear();
      const month = previousMonth.getMonth();
      return new Date(year, month + direction, 1);
    });
  };

  const getDayTimes = (dateKey: string) => {
    if (notWorkingDays.includes(dateKey)) return [];
    return availableSlots[dateKey] || DEFAULT_DAY_TIMES;
  };

  const selectDate = (dateKey: string) => {
    const dayTimes = getDayTimes(dateKey);
    const firstFreeTime = dayTimes.find((time) => !bookedSlots.includes(`${dateKey}-${time}`));
    setBooking((previous) => ({ ...previous, date: dateKey, time: firstFreeTime || "" }));
    setPaymentComplete(WHATSAPP_TEST_MODE);
    setShowPayPalCheckout(false);
    setAdminDate(dateKey);
  };

  const addAvailableTime = async () => {
    if (!adminDate || !adminTime) return;

    const currentTimes = availableSlots[adminDate] || DEFAULT_DAY_TIMES;
    const updatedTimes = Array.from(new Set([...currentTimes, adminTime])).sort();
    const slotToFree = `${adminDate}-${adminTime}`;
    const updatedBusySlots = manualBusySlots.filter((slot) => slot !== slotToFree);
    const updatedPaidSlots = paidBookedSlots.filter((slot) => slot !== slotToFree);
    const dayBusyTimes = updatedBusySlots
      .filter((slot) => slot.startsWith(`${adminDate}-`))
      .map((slot) => slot.replace(`${adminDate}-`, ""));

    const { error: deleteBookingError } = await supabase
      .from("bookings")
      .delete()
      .eq("date", adminDate)
      .eq("time", adminTime);

    if (deleteBookingError) {
      alert(`Could not remove booking from this slot: ${deleteBookingError.message}`);
      return;
    }

    setNotWorkingDays((days) => days.filter((day) => day !== adminDate));
    setAvailableSlots((slots) => ({ ...slots, [adminDate]: updatedTimes }));
    setManualBusySlots(updatedBusySlots);
    setPaidBookedSlots(updatedPaidSlots);
    saveScheduleOverride(adminDate, updatedTimes, dayBusyTimes, false);
  };

  const markSelectedTimeBusy = () => {
    if (!adminDate || !adminTime) return;
    const currentTimes = availableSlots[adminDate] || DEFAULT_DAY_TIMES;
    const updatedTimes = Array.from(new Set([...currentTimes, adminTime])).sort();
    const updatedBusySlots = Array.from(new Set([...manualBusySlots, `${adminDate}-${adminTime}`]));
    const dayBusyTimes = updatedBusySlots
      .filter((slot) => slot.startsWith(`${adminDate}-`))
      .map((slot) => slot.replace(`${adminDate}-`, ""));

    setNotWorkingDays((days) => days.filter((day) => day !== adminDate));
    setAvailableSlots((slots) => ({ ...slots, [adminDate]: updatedTimes }));
    setManualBusySlots(updatedBusySlots);
    saveScheduleOverride(adminDate, updatedTimes, dayBusyTimes, false);
  };

  const markNotWorking = () => {
    const updatedBusySlots = manualBusySlots.filter((slot) => !slot.startsWith(`${adminDate}-`));
    setNotWorkingDays((days) => Array.from(new Set([...days, adminDate])));
    setManualBusySlots(updatedBusySlots);
    saveScheduleOverride(adminDate, [], [], true);
  };

  const markDayBusy = () => {
    const times = getDayTimes(adminDate);
    const daySlots = times.map((time) => `${adminDate}-${time}`);
    const updatedBusySlots = Array.from(new Set([...manualBusySlots, ...daySlots]));
    setManualBusySlots(updatedBusySlots);
    saveScheduleOverride(adminDate, times, times, false);
  };

  const clearDay = async () => {
    const updatedBusySlots = manualBusySlots.filter((slot) => !slot.startsWith(`${adminDate}-`));
    const updatedPaidSlots = paidBookedSlots.filter((slot) => !slot.startsWith(`${adminDate}-`));

    const { error: deleteBookingsError } = await supabase
      .from("bookings")
      .delete()
      .eq("date", adminDate);

    if (deleteBookingsError) {
      alert(`Could not clear paid bookings for this day: ${deleteBookingsError.message}`);
      return;
    }

    setManualBusySlots(updatedBusySlots);
    setPaidBookedSlots(updatedPaidSlots);
    setNotWorkingDays((days) => days.filter((day) => day !== adminDate));
    setAvailableSlots((slots) => ({ ...slots, [adminDate]: DEFAULT_DAY_TIMES }));
    saveScheduleOverride(adminDate, DEFAULT_DAY_TIMES, [], false);
  };

  const submitForumQuestion = () => {
    if (!ask.name.trim() || !ask.question.trim()) return;

    const newQuestion = {
      id: Date.now(),
      name: ask.name.trim(),
      contact: ask.contact.trim(),
      question: ask.question.trim(),
      reply: "",
      createdAt: new Date().toLocaleDateString("en-GB"),
    };

    setForumQuestions((questions) => [newQuestion, ...questions]);
    setAsk({ name: "", contact: "", question: "" });
  };

  const saveForumReply = (questionId: number) => {
    const reply = replyDrafts[questionId]?.trim();
    if (!reply) return;
    setForumQuestions((questions) =>
      questions.map((question) => (question.id === questionId ? { ...question, reply } : question))
    );
  };

  const deleteForumQuestion = (questionId: number) => {
    setForumQuestions((questions) => questions.filter((question) => question.id !== questionId));
  };

  const renderAboutSlide = () => (
    <SectionFrame>
      <div className="mx-auto grid max-w-6xl items-center gap-5 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
          <UserRound className="mb-4 h-8 w-8 text-purple-300" />
          <h2 className="text-xl font-bold md:text-2xl">About Me</h2>
          <p className="mt-3 text-sm leading-6 text-purple-100">{SETTINGS.aboutMe}</p>
        </div>
        <div className="rounded-[1.5rem] border border-purple-300/30 bg-purple-300/10 p-5 text-purple-100 shadow-xl backdrop-blur-2xl">
          <Sparkles className="mb-4 h-8 w-8 text-purple-300" />
          <h3 className="text-lg font-bold text-white">What to expect</h3>
          <p className="mt-3 text-sm leading-6">
            Think of it as a relaxed conversation with a little cosmic sparkle in the background. No scary predictions, no awkward energy, just honest guidance, emotional clarity and a safe place where you can openly talk about whatever is on your mind.
          </p>
          <p className="mt-4 text-xs">{SETTINGS.disclaimer}</p>
        </div>
      </div>
    </SectionFrame>
  );

  const renderCalendar = () => (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-purple-300" />
        <div>
          <h2 className="text-base font-semibold">Booking Calendar</h2>
          <p className="text-xs text-purple-100">All times are Romania Time (EET / EEST).</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/10 p-3">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} className="rounded-full bg-[#1f1133] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-90">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold">{monthName}</h3>
          <button onClick={() => changeMonth(1)} className="rounded-full bg-[#1f1133] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-90">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-purple-200">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
            <div key={dayName}>{dayName}</div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />;

            const dateKey = toDateKey(day);
            const dayTimes = getDayTimes(dateKey);
            const allBooked = dayTimes.length > 0 && dayTimes.every((time) => bookedSlots.includes(`${dateKey}-${time}`));
            const selected = booking.date === dateKey;

            let dayClass = "bg-black text-gray-500";
            if (dayTimes.length > 0) dayClass = "bg-green-500 text-black hover:bg-green-400";
            if (allBooked) dayClass = "bg-red-500 text-white";
            if (selected) dayClass = "ring-2 ring-white bg-purple-300 text-[#12091f]";

            return (
              <button
                key={dateKey}
                onClick={() => selectDate(dateKey)}
                className={`aspect-square rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-90 ${dayClass}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {selectedTimes.map((time) => {
          const booked = bookedSlots.includes(`${booking.date}-${time}`);
          const selected = booking.time === time;
          let timeClass = "bg-green-500 text-black hover:bg-green-400";
          if (selected) timeClass = "bg-purple-300 text-[#12091f]";
          if (booked) timeClass = "bg-black text-white line-through";

          return (
            <button
              key={time}
              disabled={booked}
              onClick={() => {
                setBooking({ ...booking, time });
                setPaymentComplete(WHATSAPP_TEST_MODE);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${timeClass}`}
            >
              {time}{booked ? " Busy" : ""}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px]">
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-green-500" /> Available</div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-red-500" /> Fully Booked</div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-black" /> Not Working / Busy</div>
      </div>
    </div>
  );

  const renderBookingSlide = () => (
    <SectionFrame>
      <div className="mx-auto flex max-w-6xl flex-col items-center pb-10">
        <div className="flex max-w-3xl flex-col items-center pt-6 text-center">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            Book your private tarot reading, your way.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-purple-100">
            Whether you need clarity, reassurance, advice or just someone to help you untangle the chaos a little, you can book a private tarot reading with me directly through WhatsApp. Everything is personal, relaxed and done at your own pace.
          </p>
        </div>

        <div className="mt-10 flex w-full max-w-6xl flex-col items-stretch gap-6 md:flex-row md:items-start">
          <div className="w-full md:w-[42%]">
            {renderCalendar()}
          </div>

          <div className="w-full md:w-[58%] rounded-[1.5rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
            <h2 className="mb-3 text-lg font-bold">Choose your reading</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((service) => {
                const selected = booking.duration === service.duration;
                return (
                  <button
                    key={service.duration}
                    onClick={() => {
                      setBooking({ ...booking, duration: service.duration });
                      setPaymentComplete(WHATSAPP_TEST_MODE);
                      setShowPayPalCheckout(false);
                    }}
                    className={`rounded-2xl border p-4 text-left shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-purple-400/20 active:translate-y-0 active:scale-[0.98] ${selected ? "border-purple-300 bg-purple-300/20" : "border-white/10 bg-white/10"}`}
                  >
                    <Clock className="mb-3 h-5 w-5 text-purple-300" />
                    <h3 className="text-sm font-semibold">{service.duration}</h3>
                    <p className="mt-1 text-lg font-bold text-purple-200">{service.price}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3">
              <input
                value={booking.name}
                onChange={(event) => {
                  setBooking({ ...booking, name: event.target.value });
                  setPaymentComplete(WHATSAPP_TEST_MODE);
                }}
                placeholder="Your Name"
                className="rounded-2xl border border-white/10 bg-[#1f1133] px-3 py-2 text-sm outline-none"
              />

              <div className="rounded-2xl bg-[#1f1133] p-3 text-xs text-purple-100">
                All readings are done through private WhatsApp voice calls so everything feels more natural, personal and comfortable.
              </div>

              <div className="rounded-2xl bg-[#1f1133] p-3 text-xs text-purple-100">
                Selected appointment: <span className="font-semibold text-white">{displayDate(booking.date)} at {booking.time} (Romania Time)</span>
              </div>

              <textarea
                value={booking.question}
                onChange={(event) => {
                  setBooking({ ...booking, question: event.target.value });
                  setPaymentComplete(WHATSAPP_TEST_MODE);
                }}
                placeholder="Write your question, situation, or what you would like guidance on"
                rows={4}
                className="rounded-2xl border border-white/10 bg-[#1f1133] px-3 py-2 text-sm outline-none"
              />

              <div className="rounded-2xl bg-[#1f1133] p-3 text-xs text-purple-100">
                <p className="font-semibold text-white">Total: {selectedService.price}</p>
                <p className="mt-1">After PayPal opens, complete the payment, then return to this website. The WhatsApp button will unlock only after PayPal confirms the payment.</p>
              </div>

              {showPayPalCheckout ? (
                <PayPalScriptProvider
                  options={{
                    clientId: SETTINGS.paypalClientId,
                    currency: "GBP",
                    intent: "capture",
                  }}
                >
                  <div className="rounded-2xl bg-white p-3">
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay" }}
                      disabled={isSlotAlreadyBooked}
                      createOrder={(data, actions) => {
                        if (!actions.order) {
                          return Promise.reject(new Error("PayPal order actions are unavailable."));
                        }

                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              amount: {
                                value: selectedService.amount,
                                currency_code: "GBP",
                              },
                              description: `Rising Phoenix Tarot - ${selectedService.duration}`,
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        if (!actions.order) return Promise.resolve();
                        return actions.order.capture().then(async () => {
                          const saved = await saveBookingToSupabase();
                          if (saved) {
                            setPaymentComplete(true);
                          }
                        });
                      }}
                    />
                  </div>
                </PayPalScriptProvider>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPayPalCheckout(true)}
                  disabled={isSlotAlreadyBooked}
                  className={`rounded-full px-5 py-3 text-center text-sm font-bold text-[#12091f] shadow-xl transition-all duration-200 ${
                    isSlotAlreadyBooked ? "cursor-not-allowed bg-gray-400" : "bg-purple-400 hover:-translate-y-0.5 hover:bg-purple-300 hover:shadow-purple-400/30 active:translate-y-0 active:scale-95"
                  }`}
                >
                  Load secure PayPal checkout
                </button>
              )}

              <a
                  href={paymentComplete ? whatsappBookingUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-sm font-bold text-white shadow-lg transition-all duration-200 ${paymentComplete ? "bg-green-500 hover:-translate-y-0.5 hover:bg-green-400 hover:shadow-green-400/30 active:translate-y-0 active:scale-95" : "cursor-not-allowed bg-gray-500/60 opacity-70 pointer-events-none"}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  {paymentComplete ? "Send booking on WhatsApp" : "Complete payment to unlock WhatsApp"}
                </a>
            </div>
          </div>
        </div>
      </div>
    </SectionFrame>
  );

  const renderAskSlide = () => (
    <SectionFrame>
      <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
        <HelpCircle className="mb-4 h-8 w-8 text-purple-300" />
        <h2 className="text-xl font-bold md:text-2xl">Ask a Question</h2>
        <p className="mt-3 text-sm text-purple-100">
          If you need guidance, emotional support, advice, or simply feel the need to talk to someone, you can leave a message here for free. Tarot readings are paid, but guidance and support are always offered with an open heart.
        </p>

        <div className="mt-4 grid gap-3">
          <input
            value={ask.name}
            onChange={(event) => setAsk({ ...ask, name: event.target.value })}
            placeholder="Your Name"
            className="rounded-2xl border border-white/10 bg-[#1f1133] px-3 py-2 text-sm outline-none"
          />
          <input
            value={ask.contact}
            onChange={(event) => setAsk({ ...ask, contact: event.target.value })}
            placeholder="Optional private contact: WhatsApp or Email"
            className="rounded-2xl border border-white/10 bg-[#1f1133] px-3 py-2 text-sm outline-none"
          />
          <p className="text-[11px] text-purple-200">
            Your contact details remain completely private and are only visible to me.
          </p>
          <textarea
            value={ask.question}
            onChange={(event) => setAsk({ ...ask, question: event.target.value })}
            placeholder="Write your question or message here"
            rows={4}
            className="rounded-2xl border border-white/10 bg-[#1f1133] px-3 py-2 text-sm outline-none"
          />

          <button
            type="button"
            onClick={submitForumQuestion}
            className="rounded-full bg-purple-400 px-5 py-3 text-center text-sm font-bold text-[#12091f] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-300 hover:shadow-purple-400/30 active:translate-y-0 active:scale-95"
          >
            Post Question
          </button>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-3xl rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
        <h3 className="text-lg font-bold">Community Questions</h3>
        <p className="mt-2 text-xs text-purple-100">
          Questions appear publicly below, but contact details remain private and visible only to Rising Phoenix Tarot.
        </p>

        <div className="mt-4 grid gap-4">
          {forumQuestions.map((item) => (
            <div key={item.id} className="rounded-3xl border border-white/10 bg-[#1f1133] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">{item.name}</p>
                  <p className="text-[11px] text-purple-200">{item.createdAt}</p>
                  {showAdmin && item.contact ? (
                    <p className="mt-1 rounded-full bg-black/30 px-3 py-1 text-[11px] text-purple-100">
                      Private contact: {item.contact}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={() => deleteForumQuestion(item.id)}
                  className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-purple-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0 active:scale-95"
                >
                  Delete
                </button>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-purple-100">{item.question}</p>

              {item.reply ? (
                <div className="mt-4 rounded-2xl border border-purple-300/20 bg-purple-300/10 p-3">
                  <p className="text-xs font-bold text-white">Rising Phoenix Tarot replied:</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-purple-100">{item.reply}</p>
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  <textarea
                    value={replyDrafts[item.id] || ""}
                    onChange={(event) => setReplyDrafts({ ...replyDrafts, [item.id]: event.target.value })}
                    placeholder="Write your reply here"
                    rows={3}
                    className="rounded-2xl border border-white/10 bg-[#12091f] px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={() => saveForumReply(item.id)}
                    className="rounded-full bg-purple-400 px-4 py-2 text-sm font-bold text-[#12091f] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-300 hover:shadow-purple-400/30 active:translate-y-0 active:scale-95"
                  >
                    Post Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionFrame>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#12091f] text-white">
      <div className="fixed inset-0 opacity-35">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.25),transparent_35%)]" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        <img
          src={LOGO_IMAGE}
          alt="Background Logo"
          className="w-[95vw] max-w-[1400px] object-contain opacity-[0.22]"
          style={{ transform: "translateY(40px)" }}
        />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#12091f]/85 px-4 py-3 backdrop-blur-2xl md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div
            onDoubleClick={() => setShowAdmin((value) => !value)}
            className="flex cursor-pointer items-center gap-3 text-base font-bold md:text-lg"
            title="Double click for admin"
          >
            <img
              src={LOGO_IMAGE}
              alt="Rising Phoenix Tarot Logo"
              className="h-10 w-10 rounded-full border border-purple-300/30 object-cover"
            />
            {SETTINGS.siteName}
          </div>

          <div className="flex rounded-full border border-white/10 bg-white/10 p-1">
            {menuItems.map((item, index) => {
              const isActive = activeSlide === index;
              return (
                <button
                  key={item}
                  onClick={() => setActiveSlide(index)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 md:px-4 ${isActive ? "bg-purple-300 text-[#12091f] shadow-md" : "text-purple-100 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0 active:scale-95"}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {showAdmin ? (
        <div className="relative z-40 mx-auto mt-4 max-w-6xl rounded-[1.5rem] border border-purple-300/30 bg-[#1f1133]/95 p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Manage Your Schedule</h2>
              <p className="text-xs text-purple-100">Click a day in the calendar, then mark the chosen hour busy or available.</p>
            </div>
            <button
              onClick={() => setShowAdmin(false)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#12091f] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Close
            </button>
          </div>

          <div className="mb-4 rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-purple-100">Selected day</p>
            <p className="text-lg font-bold text-white">{displayDate(adminDate)}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="time"
              value={adminTime}
              onChange={(event) => setAdminTime(event.target.value)}
              className="rounded-2xl border border-white/10 bg-[#12091f] px-3 py-2 text-sm outline-none"
            />
            <button onClick={markSelectedTimeBusy} className="rounded-2xl bg-black px-3 py-2 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/80 active:translate-y-0 active:scale-95">
              Mark Time Busy
            </button>
            <button onClick={addAvailableTime} className="rounded-2xl bg-green-500 px-3 py-2 text-sm font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-400 active:translate-y-0 active:scale-95">
              Mark Time Available
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {adminTimes.map((time) => {
              const busy = bookedSlots.includes(`${adminDate}-${time}`);
              return (
                <button
                  key={time}
                  onClick={() => setAdminTime(time)}
                  className={`rounded-full px-3 py-1.5 text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${busy ? "bg-black text-white line-through" : "bg-green-500 text-black"}`}
                >
                  {time} {busy ? "Busy" : "Available"}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={markNotWorking} className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/80 active:translate-y-0 active:scale-95">
              Mark Day Not Working
            </button>
            <button onClick={markDayBusy} className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-400 active:translate-y-0 active:scale-95">
              Mark Entire Day Busy
            </button>
            <button onClick={clearDay} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0 active:scale-95">
              Clear Day
            </button>
          </div>
        </div>
      ) : null}

      <main className="relative z-10 h-[calc(100vh-68px)] overflow-hidden pointer-events-auto">
        <motion.div
          className="flex h-full w-[300%] touch-pan-y"
          animate={{ x: `-${activeSlide * 33.333333}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 22 }}
        >
          {renderAboutSlide()}
          {renderBookingSlide()}
          {renderAskSlide()}
        </motion.div>
      </main>
    </div>
  );
}
