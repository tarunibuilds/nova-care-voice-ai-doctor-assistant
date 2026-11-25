import { useState, useRef, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Activity,
  UserRound,
  Clock,
  MessageSquare,
} from "lucide-react";

const API = "http://localhost:5000/api";

function parseDate(text) {
  const value = text.toLowerCase().trim();
  const now = new Date();
  const yyyy = now.getFullYear();

  // Handle a spoken day number such as "28" by choosing its next occurrence.
  const bareDay = value.match(/^\s*(\d{1,2})\s*$/);
  if (bareDay) {
    const day = Number(bareDay[1]);
    if (day >= 1 && day <= 31) {
      let candidate = new Date(now.getFullYear(), now.getMonth(), day);
      if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate()) || candidate.getMonth() !== now.getMonth()) {
        candidate = new Date(now.getFullYear(), now.getMonth() + 1, day);
      }
      if (candidate.getDate() === day) return formatDate(candidate);
    }
  }

  if (value.includes("today")) return formatDate(now);
  if (value.includes("tomorrow")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }

  const iso = value.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(iso[3]).padStart(2, "0")}`;

  const numeric = value.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (numeric) {
    let year = numeric[3] ? Number(numeric[3]) : yyyy;
    if (year < 100) year += 2000;
    return `${year}-${String(Number(numeric[2])).padStart(2, "0")}-${String(Number(numeric[1])).padStart(2, "0")}`;
  }

  const monthNames = {
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
    april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
    august: 8, aug: 8, september: 9, sep: 9, october: 10, oct: 10,
    november: 11, nov: 11, december: 12, dec: 12,
  };
  const monthMatch = value.match(/\b(\d{1,2})\s+([a-z]+)(?:\s+(20\d{2}))?\b|\b([a-z]+)\s+(\d{1,2})(?:\s+(20\d{2}))?\b/);
  if (monthMatch) {
    let day, month, year;
    if (monthMatch[1]) {
      day = Number(monthMatch[1]); month = monthNames[monthMatch[2]]; year = Number(monthMatch[3]) || yyyy;
    } else {
      month = monthNames[monthMatch[4]]; day = Number(monthMatch[5]); year = Number(monthMatch[6]) || yyyy;
    }
    if (month) {
      const candidate = new Date(year, month - 1, day);
      if (!monthMatch[3] && !monthMatch[6] && candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) candidate.setFullYear(year + 1);
      return formatDate(candidate);
    }
  }
  return value;
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseTime(text) {
  const value = text.toLowerCase().replace(/\./g, "").trim();
  const match = value.match(/\b(\d{1,2})(?:\s*:\s*(\d{2}))?\s*(am|pm)?\b/);
  if (!match) return text.trim();
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const suffix = match[3];
  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  if (!suffix && hour <= 7) hour += 12;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parsePhone(text) {
  const digitMap = {
    zero: "0", oh: "0", one: "1", two: "2", three: "3", four: "4",
    five: "5", six: "6", seven: "7", eight: "8", nine: "9",
  };
  const tokens = text.toLowerCase().match(/\d+|zero|oh|one|two|three|four|five|six|seven|eight|nine/g) || [];
  let digits = tokens.map((token) => digitMap[token] ?? token).join("");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  return digits.slice(-10);
}

function AIReceptionistPage() {
  const [callActive, setCallActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [callTime, setCallTime] = useState("00:00");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const callActiveRef = useRef(false);
  const mutedRef = useRef(false);
  const timerRef = useRef(null);
  const secondsRef = useRef(0);
  const speakingRef = useRef(false);
  const recognitionRunningRef = useRef(false);
  const bookingStepRef = useRef("idle");
  const bookingDataRef = useRef({});
  const restartTimerRef = useRef(null);

  useEffect(() => { callActiveRef.current = callActive; }, [callActive]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        const minutes = Math.floor(secondsRef.current / 60);
        const seconds = secondsRef.current % 60;
        setCallTime(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  function startListening() {
    const recognition = recognitionRef.current;
    if (!recognition || !callActiveRef.current || mutedRef.current || speakingRef.current || recognitionRunningRef.current) return;
    try {
      recognition.start();
    } catch (error) {
      console.log("Recognition start:", error.message);
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      recognitionRunningRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      recognitionRunningRef.current = false;
      setListening(false);
      if (callActiveRef.current && !mutedRef.current && !speakingRef.current) {
        restartTimerRef.current = window.setTimeout(startListening, 600);
      }
    };

    recognition.onerror = (event) => {
      recognitionRunningRef.current = false;
      console.log("Speech recognition error:", event.error);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result?.isFinal) return;
      const spokenText = result[0].transcript.trim();
      if (!spokenText) return;
      setTranscript((prev) => [...prev, { speaker: "Caller", message: spokenText }]);
      handleVoiceResponse(spokenText);
    };

    recognitionRef.current = recognition;
    return () => {
      clearTimeout(restartTimerRef.current);
      try { recognition.stop(); } catch (error) { console.log(error); }
    };
  }, []);

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      startListening();
      return;
    }
    window.speechSynthesis.cancel();
    speakingRef.current = true;
    try { recognitionRef.current?.stop(); } catch (error) { console.log(error); }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.onend = utterance.onerror = () => {
      speakingRef.current = false;
      if (callActiveRef.current && !mutedRef.current) {
        window.setTimeout(startListening, 400);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function respond(text) {
    setTranscript((prev) => [...prev, { speaker: "NOVA", message: text }]);
    speak(text);
  }

  async function findDoctor(text) {
    try {
      const response = await fetch(`${API}/doctors`);
      if (!response.ok) throw new Error("Could not load doctors");
      const doctors = await response.json();
      const normalized = text.toLowerCase().replace(/\bdr\.?\s*/g, "").trim();
      return doctors.find((doctor) => {
        const name = doctor.name.toLowerCase().replace(/\bdr\.?\s*/g, "");
        const specialization = (doctor.specialization || "").toLowerCase();
        return normalized.includes(name) || name.includes(normalized) ||
          normalized.includes(specialization) || specialization.includes(normalized);
      }) || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function bookAppointment() {
  const data = bookingDataRef.current;

  try {
    // Step 1: Check doctor availability
    const availabilityResponse = await fetch(
      `http://localhost:5000/api/doctors/availability?doctor=${encodeURIComponent(data.doctor)}&date=${encodeURIComponent(data.date)}`
    );

    const availability = await availabilityResponse.json();

    if (!availabilityResponse.ok) {
      throw new Error(availability.message || "Availability check failed.");
    }

    if (!availability.available) {
      bookingStepRef.current = "doctor";
      respond("Sorry, this doctor is currently unavailable. Please choose another doctor.");
      return;
    }

    // Normalize times for comparison
    function normalizeTimeSlot(time) {
      const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

      if (!match) {
        return time.trim().toLowerCase();
      }

      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return `${String(hours).padStart(2, "0")}:${minutes}`;
    }

    // Step 2: Check if the requested time is already booked
    const requestedTime = normalizeTimeSlot(data.time);

    const alreadyBooked = availability.bookedSlots.some(
      (slot) => normalizeTimeSlot(slot) === requestedTime
    );

    if (alreadyBooked) {
      bookingStepRef.current = "time";
      respond("That time slot is already booked. Please choose another time.");
      return;
    }

    // Step 3: Book the appointment
    const response = await fetch(
      "http://localhost:5000/api/appointments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        bookingStepRef.current = "time";
        respond("That time slot is already booked. Please choose another time.");
        return;
      }

      throw new Error(result.message || "Booking failed.");
    }

    // Step 4: Successful booking
    bookingStepRef.current = "idle";
    bookingDataRef.current = {};

    respond(
      `Your appointment has been booked successfully with ${data.doctor} on ${data.date} at ${data.time}. Thank you for choosing NOVA CARE.`
    );
  } catch (error) {
    console.error("Booking error:", error);

    // Keep the caller at confirmation so they can retry without repeating details.
    bookingStepRef.current = "confirm";

    respond(
      "Sorry, I was unable to complete the booking. Your details are still saved. Please say confirm to retry or cancel."
    );
  }
}

  async function cancelAppointment(phone) {
    try {
      const response = await fetch(`${API}/appointments/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 404) respond("I couldn't find an appointment for that phone number.");
        else if (response.status === 409) respond("There are multiple appointments under that number. Please contact the clinic to help cancel the correct one.");
        else respond(result.message || "Sorry, I couldn't cancel that appointment.");
        return;
      }
      bookingStepRef.current = "idle";
      bookingDataRef.current = {};
      respond("Your appointment cancellation was successful.");
    } catch (error) {
      console.error(error);
      respond("Sorry, I couldn't complete the cancellation.");
    }
  }

  async function handleVoiceResponse(spokenText) {
    const text = spokenText.trim();
    const message = text.toLowerCase();

    if (bookingStepRef.current === "idle" && message.includes("cancel")) {
      bookingStepRef.current = "cancel_phone";
      respond("Please tell me the ten digit phone number used for the appointment.");
      return;
    }

    if (bookingStepRef.current === "cancel_phone") {
      const phone = parsePhone(text);
      if (phone.length !== 10) {
        respond("I couldn't recognize the ten digit number. Please say it again.");
        return;
      }
      await cancelAppointment(phone);
      return;
    }

    if (bookingStepRef.current === "idle" && (message.includes("book") || message.includes("appointment") || message.includes("consult"))) {
      bookingDataRef.current = {};
      bookingStepRef.current = "doctor";
      respond("Sure! Which doctor or medical specialization would you like?");
      return;
    }

    if (bookingStepRef.current === "doctor") {
      const doctor = await findDoctor(message);
      if (!doctor) {
        respond("I couldn't identify that doctor. Please say the doctor's name or specialization, such as general physician, cardiologist, or dermatologist.");
        return;
      }
      if (doctor.available === 0 || doctor.available === false) {
        respond("That doctor is currently unavailable. Please choose another doctor.");
        return;
      }
      bookingDataRef.current.doctor = doctor.name;
      bookingDataRef.current.reason = doctor.specialization;
      bookingStepRef.current = "date";
      respond(`You selected ${doctor.name}, ${doctor.specialization}. Which date would you prefer? You can say today, tomorrow, or a date.`);
      return;
    }

    if (bookingStepRef.current === "date") {
      bookingDataRef.current.date = parseDate(text);
      bookingStepRef.current = "time";
      respond("What time would you like your appointment? For example, 10 AM or 4 PM.");
      return;
    }

    if (bookingStepRef.current === "time") {
      bookingDataRef.current.time = parseTime(text);
      if (bookingDataRef.current.patient && bookingDataRef.current.phone) {
        bookingStepRef.current = "confirm";
        const d = bookingDataRef.current;
        respond(`Please confirm your appointment. Patient ${d.patient}, doctor ${d.doctor}, date ${d.date}, time ${d.time}. Say confirm to book or cancel to stop.`);
        return;
      }
      bookingStepRef.current = "name";
      respond("May I know your full name?");
      return;
    }

    if (bookingStepRef.current === "name") {
      bookingDataRef.current.patient = text.trim();
      bookingStepRef.current = "phone";
      respond("Please tell me your ten digit mobile phone number.");
      return;
    }

    if (bookingStepRef.current === "phone") {
      const phone = parsePhone(text);
      if (phone.length !== 10) {
        respond("I couldn't recognize a ten digit phone number. Please say your mobile number again, one digit at a time if possible.");
        return;
      }
      bookingDataRef.current.phone = phone;
      setPhoneNumber(phone);
      bookingStepRef.current = "confirm";
      const data = bookingDataRef.current;
      respond(`Please confirm your appointment. Patient ${data.patient}, doctor ${data.doctor}, date ${data.date}, time ${data.time}, phone number ${data.phone}. Say confirm to book or cancel to stop.`);
      return;
    }

    if (bookingStepRef.current === "confirm") {
      const confirmation = message.replace(/[^a-z\s]/g, " ").trim();
      if (["confirm", "yes", "book", "appointment", "okay", "correct", "go ahead", "do it", "to book", "confirm the appointment", "book it", "yes book", "please book"].some((phrase) => confirmation === phrase || confirmation.includes(phrase))) {
        await bookAppointment();
        return;
      }
      if (message.includes("cancel") || message.includes("no")) {
        bookingStepRef.current = "idle";
        bookingDataRef.current = {};
        respond("Okay, your booking request has been cancelled.");
        return;
      }
      respond("Please say confirm to book your appointment, or say cancel.");
      return;
    }

    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      respond("Hello! Welcome to NOVA CARE. How can I help you today?");
      return;
    }
    if (message.includes("thank")) {
      respond("You're welcome! Thank you for contacting NOVA CARE.");
      return;
    }
    respond("I can help you book or cancel a doctor appointment. Would you like to book an appointment?");
  }

  const handleStartCall = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    bookingStepRef.current = "idle";
    bookingDataRef.current = {};
    setCallActive(true);
    setMuted(false);
    secondsRef.current = 0;
    setCallTime("00:00");
    setPhoneNumber("");
    callActiveRef.current = true;
    mutedRef.current = false;
    speakingRef.current = false;
    const greeting = "Hello! Welcome to NOVA CARE. How can I help you today?";
    setTranscript([{ speaker: "NOVA", message: greeting }]);
    speak(greeting);
  };

  const handleMute = () => {
    if (!muted) {
      mutedRef.current = true;
      setMuted(true);
      try { recognitionRef.current?.stop(); } catch (error) { console.log(error); }
    } else {
      mutedRef.current = false;
      setMuted(false);
      startListening();
    }
  };

  const handleEndCall = () => {
    callActiveRef.current = false;
    mutedRef.current = false;
    speakingRef.current = false;
    bookingStepRef.current = "idle";
    bookingDataRef.current = {};
    setCallActive(false);
    setMuted(false);
    setListening(false);
    clearInterval(timerRef.current);
    clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch (error) { console.log(error); }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setTranscript((prev) => [...prev, { speaker: "NOVA", message: "Call ended." }]);
  };

  return (
    <div className="receptionist-page">
      <div className="receptionist-header">
        <div>
          <span className="eyebrow"><span className="live-dot" /> NOVA AI</span>
          <h2>AI Receptionist</h2>
          <p>Manage and monitor your AI voice receptionist.</p>
        </div>
      </div>
      <div className="receptionist-grid">
        <div className="call-panel">
          <div className="call-panel-header">
            <div><h3>Voice Control</h3><p>Interactive voice assistant interface</p></div>
            <span className={`call-status ${callActive ? "active" : "inactive"}`}><span />{callActive ? "Call Active" : "Offline"}</span>
          </div>
          <div className="call-center">
            <div className={`call-orb ${callActive ? "call-orb-active" : ""}`}>
              <div className="call-orb-inner"><Phone size={35} /></div>
            </div>
            <h3>{callActive ? "NOVA is active" : "NOVA is ready"}</h3>
            <p>{callActive ? listening ? "NOVA is listening to your voice." : "Your voice assistant is ready." : "Start a session to activate the receptionist."}</p>
            <div className="call-timer"><Clock size={16} />{callTime}</div>
            {!callActive ? (
              <button className="start-call-button" onClick={handleStartCall}><Phone size={18} />Start Call</button>
            ) : (
              <div className="call-controls">
                <button className={`mute-button ${muted ? "muted" : ""}`} onClick={handleMute}>{muted ? <MicOff size={18} /> : <Mic size={18} />}{muted ? "Unmute" : "Mute"}</button>
                <button className="end-call-button" onClick={handleEndCall}><PhoneOff size={18} />End Call</button>
              </div>
            )}
          </div>
          <div className="call-info">
            <div className="call-info-item"><Activity size={17} /><div><span>Connection</span><strong>{callActive ? "Active session" : "Not connected"}</strong></div></div>
            <div className="call-info-item"><Mic size={17} /><div><span>Microphone</span><strong>{callActive ? muted ? "Muted" : listening ? "Listening" : "Ready" : "Inactive"}</strong></div></div>
          </div>
        </div>
        <div className="transcript-panel">
          <div className="transcript-header"><div><h3><MessageSquare size={18} />Live Transcript</h3><p>Conversation history for this session</p></div></div>
          <div className="transcript-content">
            {transcript.length === 0 ? (
              <div className="transcript-empty"><MessageSquare size={35} /><h3>No conversation yet</h3><p>Start a call to begin the conversation.</p></div>
            ) : transcript.map((item, index) => (
              <div className={`transcript-message ${item.speaker === "NOVA" ? "nova-message" : "caller-message"}`} key={index}>
                <div className="transcript-avatar">{item.speaker === "NOVA" ? <Activity size={17} /> : <UserRound size={17} />}</div>
                <div className="transcript-bubble"><strong>{item.speaker}</strong><p>{item.message}</p></div>
              </div>
            ))}
          </div>
          <div className="transcript-footer"><span><span className="live-dot" />{callActive ? listening ? "Listening" : "Session active" : "Waiting for session"}</span></div>
        </div>
      </div>
      <div className="caller-details-panel">
        <div className="caller-details-header"><div><h3>Caller Information</h3><p>Caller identification by phone number</p></div></div>
        <div className="caller-input-area">
          <div className="caller-input"><Phone size={17} /><input type="tel" placeholder="Caller phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} /></div>
          <div className="caller-note"><UserRound size={17} />Phone number is collected during the booking conversation.</div>
        </div>
      </div>
    </div>
  );
}

export default AIReceptionistPage;