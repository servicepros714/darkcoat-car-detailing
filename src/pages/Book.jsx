import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addDays,
} from 'date-fns';
import { Check, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Loader2, Sun, Sunset, Sunrise, Plus } from 'lucide-react';
import { PACKAGES, ADDON, getPackage, subtotal } from '../config/services.js';
import { BUSINESS } from '../config/business.js';
import { caNow, SLOTS, isSlotTooSoon, dateHasOpenSlots, toDateStr, fromDateStr } from '../lib/caTime.js';
import { getAvailability, apiConfigured } from '../lib/api.js';
import { loadDraft, saveDraft } from '../lib/draft.js';

const STEPS = ['Package', 'Add-on', 'Date', 'Time', 'Details'];
const MAX_DAYS_AHEAD = 60;

const FIELDS = [
  { key: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Jane Doe' },
  { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '(949) 555-0123', inputMode: 'tel' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@email.com', inputMode: 'email' },
  { key: 'vehicle', label: 'Vehicle', type: 'text', autoComplete: 'off', placeholder: 'Year Make Model — e.g. 2021 Toyota RAV4' },
  { key: 'address', label: 'Service address', type: 'text', autoComplete: 'street-address', placeholder: 'Street, city, ZIP' },
];

function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function validateField(key, value) {
  const v = (value || '').trim();
  switch (key) {
    case 'name':
      return v.length >= 2 ? '' : 'Please enter your full name.';
    case 'phone':
      return v.replace(/\D/g, '').length === 10 ? '' : 'Please enter a 10-digit phone number.';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.';
    case 'vehicle':
      return v.length >= 3 ? '' : 'Please enter your vehicle (Year Make Model).';
    case 'address':
      return v.length >= 6 ? '' : 'Please enter the service address.';
    default:
      return '';
  }
}

export default function Book() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const draft = useMemo(() => loadDraft() || {}, []);

  const queryPkg = params.get('package');
  const [step, setStep] = useState(1);
  const [pkg, setPkg] = useState(getPackage(queryPkg) ? queryPkg : draft.pkg || null);
  const [addon, setAddon] = useState(Boolean(draft.addon));
  const [date, setDate] = useState(draft.date || null);
  const [time, setTime] = useState(draft.time || null);
  const [info, setInfo] = useState({ name: '', phone: '', email: '', vehicle: '', address: '', ...(draft.info || {}) });
  const [errors, setErrors] = useState({});
  const [booked, setBooked] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const inputRefs = useRef({});

  const today = caNow().dateStr;
  const todayDate = fromDateStr(today);
  const maxDate = addDays(todayDate, MAX_DAYS_AHEAD);
  const [month, setMonth] = useState(startOfMonth(date ? fromDateStr(date) : todayDate));

  // Drop a stale draft date/time that has since passed.
  useEffect(() => {
    if (date && (date < today || !dateHasOpenSlots(date))) {
      setDate(null);
      setTime(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the draft saved as they go.
  useEffect(() => {
    saveDraft({ pkg, addon, date, time, info });
  }, [pkg, addon, date, time, info]);

  // Scroll to top whenever the step changes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [step]);

  // Load booked slots for the chosen date.
  useEffect(() => {
    if (step !== 4 || !date) return undefined;
    let cancelled = false;
    setLoadingSlots(true);
    getAvailability(date)
      .then((res) => {
        if (!cancelled) setBooked(res.booked || []);
      })
      .catch(() => {
        if (!cancelled) {
          setBooked([]);
          if (apiConfigured) toast.error('Couldn’t load live availability — we’ll confirm your time.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, date]);

  // If the saved time turns out to be taken, clear it.
  useEffect(() => {
    if (time && booked.includes(time)) setTime(null);
  }, [booked, time]);

  const total = subtotal(pkg, addon);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const canPrevMonth = startOfMonth(month) > startOfMonth(todayDate);
  const canNextMonth = startOfMonth(addMonths(month, 1)) <= maxDate;

  function next() {
    if (step === 1 && !pkg) return toast.error('Choose a package to continue.');
    if (step === 3 && !date) return toast.error('Pick a date to continue.');
    if (step === 4 && !time) return toast.error('Pick a time to continue.');
    if (step === 5) {
      const errs = {};
      FIELDS.forEach((f) => {
        const e = validateField(f.key, info[f.key]);
        if (e) errs[f.key] = e;
      });
      setErrors(errs);
      const first = FIELDS.find((f) => errs[f.key]);
      if (first) {
        toast.error(`${first.label}: ${errs[first.key]}`);
        const el = inputRefs.current[first.key];
        if (el) {
          el.focus();
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        return undefined;
      }
      saveDraft({ pkg, addon, date, time, info });
      navigate('/checkout');
      return undefined;
    }
    setStep((s) => Math.min(5, s + 1));
    return undefined;
  }

  function back() {
    if (step === 1) navigate('/');
    else setStep((s) => s - 1);
  }

  function updateField(key, raw) {
    const value = key === 'phone' ? formatPhone(raw) : raw;
    setInfo((i) => ({ ...i, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: validateField(key, value) }));
  }

  const slotGroups = [
    { label: 'Morning', icon: Sunrise, slots: SLOTS.filter((s) => s.hour < 12) },
    { label: 'Afternoon', icon: Sun, slots: SLOTS.filter((s) => s.hour >= 12 && s.hour < 16) },
    { label: 'Evening', icon: Sunset, slots: SLOTS.filter((s) => s.hour >= 16) },
  ];

  return (
    <div className="flow flow--steps">
      <div className="container flow__container">
        <div className="flow__top">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Back to site
          </Link>
          <span className="flow__count">
            Step {step} of {STEPS.length}
          </span>
        </div>

        <ol className="gauge" aria-label="Booking progress">
          {STEPS.map((s, i) => (
            <li key={s} className={i + 1 < step ? 'is-done' : i + 1 === step ? 'is-current' : ''}>
              <span className="gauge__bar" />
              <span className="gauge__label">{s}</span>
            </li>
          ))}
        </ol>

        <div className="flow__card">
          {/* STEP 1 — Package */}
          {step === 1 && (
            <section className="step">
              <header className="step__head">
                <p className="eyebrow">Step 1</p>
                <h1 className="step__title">Choose your interior package</h1>
                <p className="muted">You can add the Exterior Wash in the next step.</p>
              </header>
              <div className="choice-grid">
                {PACKAGES.map((p) => {
                  const selected = pkg === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`choice ${selected ? 'is-selected' : ''}`}
                      onClick={() => setPkg(p.id)}
                      aria-pressed={selected}
                    >
                      <span className="choice__check" aria-hidden="true">
                        <Check size={15} strokeWidth={3} />
                      </span>
                      <span className="choice__top">
                        <span className="choice__name">
                          {p.name}
                          {p.popular && <em className="pill">Most booked</em>}
                        </span>
                        <span className="choice__price">${p.price}</span>
                      </span>
                      <span className="choice__tag">{p.tagline}</span>
                      <ul className="choice__list">
                        {p.features.map((f) => (
                          <li key={f}>
                            <Check size={13} strokeWidth={3} /> {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 2 — Add-on */}
          {step === 2 && (
            <section className="step">
              <header className="step__head">
                <p className="eyebrow">Step 2 · Optional</p>
                <h1 className="step__title">Add an Exterior Wash?</h1>
                <p className="muted">Tap to add it to your {getPackage(pkg)?.name}. Skip it by pressing Continue.</p>
              </header>
              <button
                type="button"
                className={`addon ${addon ? 'is-selected' : ''}`}
                onClick={() => setAddon((a) => !a)}
                aria-pressed={addon}
              >
                <span className="addon__media">
                  <img src={ADDON.image} alt="" />
                </span>
                <span className="addon__body">
                  <span className="addon__top">
                    <span className="choice__check" aria-hidden="true">
                      <Check size={15} strokeWidth={3} />
                    </span>
                    <span className="choice__name">{ADDON.name}</span>
                    <span className="choice__price">+${ADDON.price}</span>
                  </span>
                  <ul className="choice__list choice__list--2col">
                    {ADDON.features.map((f) => (
                      <li key={f}>
                        <Check size={13} strokeWidth={3} /> {f}
                      </li>
                    ))}
                  </ul>
                  <span className={`addon__state ${addon ? 'is-on' : ''}`}>
                    {addon ? (
                      <>
                        <Check size={15} strokeWidth={3} /> Added — tap to remove
                      </>
                    ) : (
                      <>
                        <Plus size={15} strokeWidth={3} /> Tap to add
                      </>
                    )}
                  </span>
                </span>
              </button>
            </section>
          )}

          {/* STEP 3 — Date */}
          {step === 3 && (
            <section className="step">
              <header className="step__head">
                <p className="eyebrow">Step 3</p>
                <h1 className="step__title">Pick a date</h1>
                <p className="muted">We detail 7 days a week. Same-day slots open until 4 hours before start time.</p>
              </header>
              <div className="cal">
                <div className="cal__head">
                  <button
                    type="button"
                    onClick={() => setMonth((m) => subMonths(m, 1))}
                    disabled={!canPrevMonth}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <strong>{format(month, 'MMMM yyyy')}</strong>
                  <button
                    type="button"
                    onClick={() => setMonth((m) => addMonths(m, 1))}
                    disabled={!canNextMonth}
                    aria-label="Next month"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="cal__dow">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="cal__grid">
                  {days.map((d) => {
                    const ds = toDateStr(d);
                    const outside = !isSameMonth(d, month);
                    const disabled = outside || ds < today || d > maxDate || !dateHasOpenSlots(ds);
                    const selected = date === ds;
                    return (
                      <button
                        key={ds}
                        type="button"
                        disabled={disabled}
                        className={`cal__day ${selected ? 'is-selected' : ''} ${ds === today ? 'is-today' : ''} ${outside ? 'is-outside' : ''}`}
                        onClick={() => {
                          if (date !== ds) setTime(null);
                          setDate(ds);
                        }}
                        aria-pressed={selected}
                        aria-label={format(d, 'EEEE, MMMM d')}
                      >
                        {outside ? '' : format(d, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
              {date && (
                <p className="selection-note">
                  <Check size={15} strokeWidth={3} /> {format(fromDateStr(date), 'EEEE, MMMM d, yyyy')}
                </p>
              )}
            </section>
          )}

          {/* STEP 4 — Time */}
          {step === 4 && (
            <section className="step">
              <header className="step__head">
                <p className="eyebrow">Step 4</p>
                <h1 className="step__title">Pick a start time</h1>
                <p className="muted">{date && format(fromDateStr(date), 'EEEE, MMMM d')} · Pacific Time</p>
              </header>
              {loadingSlots ? (
                <div className="slots-loading">
                  <Loader2 className="spin" size={22} /> Checking availability…
                </div>
              ) : (
                <div className="slot-groups">
                  {slotGroups.map(({ label, icon: Icon, slots }) => (
                    <div key={label} className="slot-group">
                      <p className="slot-group__label">
                        <Icon size={15} /> {label}
                      </p>
                      <div className="slots">
                        {slots.map((s) => {
                          const taken = booked.includes(s.label);
                          const soon = isSlotTooSoon(date, s.minutes);
                          const disabled = taken || soon;
                          return (
                            <button
                              key={s.label}
                              type="button"
                              disabled={disabled}
                              className={`slot ${time === s.label ? 'is-selected' : ''}`}
                              onClick={() => setTime(s.label)}
                              aria-pressed={time === s.label}
                              title={taken ? 'Already booked' : soon ? 'Too soon to book' : ''}
                            >
                              {s.label}
                              {taken && <small>Booked</small>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 5 — Details */}
          {step === 5 && (
            <section className="step">
              <header className="step__head">
                <p className="eyebrow">Step 5</p>
                <h1 className="step__title">Where should we pull up?</h1>
                <p className="muted">We’ll reach out before your appointment to confirm.</p>
              </header>
              <form
                className="form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
              >
                {FIELDS.map((f) => (
                  <label key={f.key} className={`field ${errors[f.key] ? 'has-error' : ''} ${f.key === 'address' || f.key === 'vehicle' ? 'field--wide' : ''}`}>
                    <span className="field__label">{f.label}</span>
                    <input
                      ref={(el) => {
                        inputRefs.current[f.key] = el;
                      }}
                      type={f.type}
                      inputMode={f.inputMode}
                      autoComplete={f.autoComplete}
                      placeholder={f.placeholder}
                      value={info[f.key]}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) setErrors((er) => ({ ...er, [f.key]: validateField(f.key, e.target.value) }));
                      }}
                      aria-invalid={Boolean(errors[f.key])}
                    />
                    {errors[f.key] && <span className="field__error">{errors[f.key]}</span>}
                  </label>
                ))}
                <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
              </form>
            </section>
          )}

          {/* Sticky action bar (fixed to the bottom on mobile) */}
          <div className="flow-bar">
            <div className="flow-bar__total">
              {pkg ? (
                <>
                  <span>{getPackage(pkg).name}{addon ? ' + Exterior' : ''}</span>
                  <strong>${total}</strong>
                </>
              ) : (
                <span>Select a package</span>
              )}
            </div>
            <div className="flow-bar__btns">
              <button type="button" className="btn btn-ghost" onClick={back}>
                <ArrowLeft size={17} /> Back
              </button>
              <button type="button" className="btn btn-red" onClick={next}>
                {step === 5 ? 'Checkout' : 'Continue'} <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        <p className="flow__help">
          Prefer to talk? Call <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
        </p>
      </div>
    </div>
  );
}
