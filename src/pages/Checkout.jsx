import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { ArrowLeft, Lock, Tag, X, Loader2, BadgePercent } from 'lucide-react';
import { getPackage, serviceLabel, subtotal, PREPAY_CODE, PREPAY_DISCOUNT } from '../config/services.js';
import { fromDateStr } from '../lib/caTime.js';
import { createPaymentIntent, createBooking, getAvailability } from '../lib/api.js';
import { loadDraft, saveDraft, clearDraft, saveLastBooking } from '../lib/draft.js';

const PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripeReady = PK.startsWith('pk_') && !PK.includes('REPLACE');
const stripePromise = stripeReady ? loadStripe(PK) : null;

const APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#D40A0F',
    colorBackground: '#16171A',
    colorText: '#E7E7EA',
    colorTextSecondary: '#A5A7AD',
    colorDanger: '#F2555A',
    fontFamily: 'Figtree, system-ui, sans-serif',
    borderRadius: '10px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid #2B2D32', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid #D40A0F', boxShadow: '0 0 0 3px rgba(212,10,15,.2)' },
    '.Tab': { border: '1px solid #2B2D32' },
    '.Tab--selected': { borderColor: '#D40A0F' },
  },
};

export function bookingPayload(draft, paymentStatus, extra = {}) {
  return {
    pkg: draft.pkg,
    addon: Boolean(draft.addon),
    coupon: draft.coupon || '',
    date: draft.date,
    time: draft.time,
    name: draft.info.name.trim(),
    phone: draft.info.phone.trim(),
    email: draft.info.email.trim(),
    vehicle: draft.info.vehicle.trim(),
    address: draft.info.address.trim(),
    payment_status: paymentStatus,
    ...extra,
  };
}

function PayForm({ draft, total, onPaid, busy, setBusy }) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setBusy(true);
    try {
      // Last-second slot check so nobody pays for a time that was just taken.
      try {
        const { booked = [] } = await getAvailability(draft.date);
        if (booked.includes(draft.time)) {
          toast.error('That time was just booked. Please choose another time.');
          setBusy(false);
          return;
        }
      } catch {
        /* if the check fails, continue — the Worker still records the booking */
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
          receipt_email: draft.info.email.trim(),
        },
      });
      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        setBusy(false);
        return;
      }
      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        await onPaid(paymentIntent.id);
      } else {
        toast.error('Payment was not completed.');
        setBusy(false);
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pay-form">
      <PaymentElement onReady={() => setReady(true)} options={{ layout: 'tabs' }} />
      <button type="submit" className="btn btn-red btn-lg btn-block" disabled={!stripe || !ready || busy}>
        {busy ? <Loader2 className="spin" size={18} /> : <Lock size={17} />}
        {busy ? 'Processing…' : `Pay $${total} & book`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const draft = useMemo(() => loadDraft(), []);
  const complete = draft && draft.pkg && draft.date && draft.time && draft.info?.name;

  const [coupon, setCoupon] = useState(draft?.coupon === PREPAY_CODE ? PREPAY_CODE : '');
  const [codeInput, setCodeInput] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [intentError, setIntentError] = useState('');
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [busy, setBusy] = useState(false);
  const couponRef = useRef(null);

  useEffect(() => {
    if (!complete) navigate('/book', { replace: true });
  }, [complete, navigate]);

  const sub = complete ? subtotal(draft.pkg, draft.addon) : 0;
  const discount = coupon === PREPAY_CODE ? PREPAY_DISCOUNT : 0;
  const total = sub - discount;

  // Keep coupon in the draft (needed if Stripe redirects for 3-D Secure).
  useEffect(() => {
    if (complete) saveDraft({ ...draft, coupon });
  }, [coupon, complete, draft]);

  // Create (or re-create) the PaymentIntent whenever the total changes.
  useEffect(() => {
    if (!complete || !stripeReady) return undefined;
    let cancelled = false;
    setLoadingIntent(true);
    setIntentError('');
    createPaymentIntent({
      pkg: draft.pkg,
      addon: Boolean(draft.addon),
      coupon,
      email: draft.info.email,
      name: draft.info.name,
      date: draft.date,
      time: draft.time,
    })
      .then((res) => {
        if (!cancelled) setClientSecret(res.clientSecret);
      })
      .catch((err) => {
        if (!cancelled) {
          setClientSecret('');
          setIntentError(err.message || 'Online payment is unavailable right now.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingIntent(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coupon, complete, draft]);

  if (!complete) return null;

  const pkg = getPackage(draft.pkg);

  function applyCode(code) {
    const c = (code || '').trim().toUpperCase();
    if (!c) {
      toast.error('Enter a coupon code.');
      couponRef.current?.focus();
      return;
    }
    if (c === PREPAY_CODE) {
      setCoupon(PREPAY_CODE);
      setCodeInput('');
      toast.success(`$${PREPAY_DISCOUNT} off applied`);
    } else {
      toast.error('That code isn’t valid.');
      couponRef.current?.focus();
    }
  }

  async function finalize(paymentStatus, paymentIntentId) {
    const payload = bookingPayload({ ...draft, coupon }, paymentStatus, paymentIntentId ? { payment_intent_id: paymentIntentId } : {});
    try {
      const res = await createBooking(payload);
      saveLastBooking({
        id: res.id,
        service: serviceLabel(draft.pkg, draft.addon),
        date: draft.date,
        time: draft.time,
        name: payload.name,
        email: payload.email,
        address: payload.address,
        total: paymentStatus === 'Paid' ? total : sub,
        payment_status: paymentStatus,
      });
      clearDraft();
      navigate('/confirmation', { replace: true });
    } catch (err) {
      setBusy(false);
      if (err.status === 409) {
        toast.error('That time was just booked. Please choose another time.');
        navigate('/book');
      } else if (paymentStatus === 'Paid') {
        toast.error('Payment received, but we couldn’t save your booking. Please call us — you won’t be charged twice.', { duration: 9000 });
      } else {
        toast.error(err.message || 'Could not save your booking.');
      }
    }
  }

  async function payLater() {
    if (busy) return;
    setBusy(true);
    await finalize('Pay Later');
  }

  return (
    <div className="flow">
      <div className="container flow__container checkout">
        <div className="checkout__top">
          <Link to="/book" className="back-link">
            <ArrowLeft size={16} /> Edit booking
          </Link>
          <span className="eyebrow eyebrow--sm">
            <Lock size={13} /> Secure checkout
          </span>
        </div>

        {!coupon && (
          <div className="prepay-banner">
            <BadgePercent size={26} />
            <div>
              <strong>Save ${PREPAY_DISCOUNT} when you prepay</strong>
              <span>Tap Apply or enter code {PREPAY_CODE} below.</span>
            </div>
            <button type="button" className="btn btn-white btn-sm" onClick={() => applyCode(PREPAY_CODE)}>
              Apply
            </button>
          </div>
        )}

        <div className="summary">
          <div className="summary__row">
            <div>
              <strong>{serviceLabel(draft.pkg, draft.addon)}</strong>
              <span>
                {format(fromDateStr(draft.date), 'EEE, MMM d')} · {draft.time}
              </span>
            </div>
            <span>${sub}</span>
          </div>
          {discount > 0 && (
            <div className="summary__row summary__row--discount">
              <div>
                <strong>
                  <Tag size={14} /> {PREPAY_CODE}
                </strong>
                <button type="button" className="text-btn" onClick={() => setCoupon('')}>
                  <X size={13} /> Remove
                </button>
              </div>
              <span>−${discount}</span>
            </div>
          )}
          <div className="summary__total">
            <span>Total</span>
            <strong>${total}</strong>
          </div>
        </div>

        {!coupon && (
          <form
            className="coupon"
            onSubmit={(e) => {
              e.preventDefault();
              applyCode(codeInput);
            }}
          >
            <label htmlFor="coupon" className="sr-only">Coupon code</label>
            <input
              id="coupon"
              ref={couponRef}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Coupon code"
              autoComplete="off"
              autoCapitalize="characters"
            />
            <button type="submit" className="btn btn-ghost">Apply</button>
          </form>
        )}

        <div className="pay-box">
          <p className="pay-box__label">Payment</p>
          {!stripeReady || intentError ? (
            <p className="pay-box__notice">
              Online payment isn’t available at the moment. You can still reserve your time below and pay after the detail.
            </p>
          ) : loadingIntent || !clientSecret ? (
            <div className="slots-loading">
              <Loader2 className="spin" size={20} /> Loading secure payment…
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: APPEARANCE }} key={clientSecret}>
              <PayForm draft={draft} total={total} onPaid={(id) => finalize('Paid', id)} busy={busy} setBusy={setBusy} />
            </Elements>
          )}
        </div>

        <p className="pay-later">
          <button type="button" className="text-link" onClick={payLater} disabled={busy}>
            I’ll pay later{discount ? ` ($${sub}, no discount)` : ''}
          </button>
        </p>
        <p className="flow__fine">Your {pkg.name} is held for the time you picked. Payments are processed securely by Stripe.</p>
      </div>
    </div>
  );
}
