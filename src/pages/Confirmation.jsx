import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle2, Loader2, Phone, CalendarDays, MapPin, Car } from 'lucide-react';
import { BUSINESS } from '../config/business.js';
import { serviceLabel, subtotal, PREPAY_CODE, PREPAY_DISCOUNT } from '../config/services.js';
import { fromDateStr } from '../lib/caTime.js';
import { createBooking } from '../lib/api.js';
import { loadDraft, clearDraft, loadLastBooking, saveLastBooking } from '../lib/draft.js';
import { bookingPayload } from './Checkout.jsx';

export default function Confirmation() {
  const [params] = useSearchParams();
  const [booking, setBooking] = useState(() => loadLastBooking());
  const [status, setStatus] = useState('idle');
  const ran = useRef(false);

  // Handles the return from a Stripe redirect (e.g. 3-D Secure).
  useEffect(() => {
    const piId = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');
    if (!piId || ran.current) return;
    ran.current = true;
    if (booking && booking.payment_intent_id === piId) return;

    const draft = loadDraft();
    if (redirectStatus !== 'succeeded' || !draft) {
      setStatus(redirectStatus === 'succeeded' ? 'idle' : 'failed');
      return;
    }
    setStatus('saving');
    const sub = subtotal(draft.pkg, draft.addon);
    const total = draft.coupon === PREPAY_CODE ? sub - PREPAY_DISCOUNT : sub;
    createBooking(bookingPayload(draft, 'Paid', { payment_intent_id: piId }))
      .then((res) => {
        const saved = {
          id: res.id,
          service: serviceLabel(draft.pkg, draft.addon),
          date: draft.date,
          time: draft.time,
          name: draft.info.name,
          email: draft.info.email,
          address: draft.info.address,
          total,
          payment_status: 'Paid',
          payment_intent_id: piId,
        };
        saveLastBooking(saved);
        clearDraft();
        setBooking(saved);
        setStatus('idle');
      })
      .catch(() => setStatus('error'));
  }, [params, booking]);

  if (status === 'saving') {
    return (
      <div className="flow">
        <div className="container flow__container confirm">
          <div className="slots-loading"><Loader2 className="spin" size={22} /> Finalizing your booking…</div>
        </div>
      </div>
    );
  }

  if (status === 'failed' || status === 'error' || !booking) {
    return (
      <div className="flow">
        <div className="container flow__container confirm">
          <div className="confirm__card">
            <h1 className="step__title">
              {status === 'failed' ? 'Payment wasn’t completed' : status === 'error' ? 'Payment received — one more step' : 'No booking found'}
            </h1>
            <p className="muted">
              {status === 'error'
                ? `Your payment went through but we couldn’t save the appointment automatically. Please call ${BUSINESS.phone} and we’ll lock in your time.`
                : 'Start a new booking or give us a call and we’ll set it up for you.'}
            </p>
            <div className="confirm__btns">
              <Link to="/book" className="btn btn-red">Book online</Link>
              <a href={BUSINESS.phoneHref} className="btn btn-ghost"><Phone size={16} /> {BUSINESS.phone}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flow">
      <div className="container flow__container confirm">
        <div className="confirm__card">
          <div className="confirm__icon"><CheckCircle2 size={44} /></div>
          <p className="eyebrow">Booking confirmed</p>
          <h1 className="step__title">You’re on the schedule, {booking.name.split(' ')[0]}.</h1>
          <p className="muted">Booking ID <strong className="confirm__id">{booking.id}</strong></p>

          <ul className="confirm__list">
            <li><Car size={18} /><div><span>Service</span><strong>{booking.service}</strong></div></li>
            <li><CalendarDays size={18} /><div><span>When</span><strong>{format(fromDateStr(booking.date), 'EEEE, MMMM d')} · {booking.time}</strong></div></li>
            <li><MapPin size={18} /><div><span>Where</span><strong>{booking.address}</strong></div></li>
          </ul>

          <div className="confirm__total">
            <span>{booking.payment_status === 'Paid' ? 'Paid online' : 'Due after service'}</span>
            <strong>${booking.total}</strong>
          </div>

          <p className="muted confirm__note">
            We’ll reach out before your appointment. Need to change something? Call or text {BUSINESS.phone}.
          </p>
          <div className="confirm__btns">
            <Link to="/" className="btn btn-red">Back to home</Link>
            <a href={BUSINESS.phoneHref} className="btn btn-ghost"><Phone size={16} /> Call us</a>
          </div>
        </div>
      </div>
    </div>
  );
}
