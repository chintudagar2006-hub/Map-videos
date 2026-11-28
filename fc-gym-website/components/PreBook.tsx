'use client';

import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check, Loader2, MessageCircle, Phone, Smartphone } from 'lucide-react';
import SplitReveal from './SplitReveal';
import Magnetic from './Magnetic';

const GOALS = ['Build strength', 'Lose fat', 'Improve general fitness', 'Functional / athletic performance', 'Not sure yet — need guidance'];
const METHODS = [
  { v: 'call', label: 'Phone call', Icon: Phone },
  { v: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { v: 'sms', label: 'SMS', Icon: Smartphone },
];

type Errors = Partial<Record<'name' | 'phone' | 'goal' | 'method', string>>;

function validate(f: FormData): Errors {
  const e: Errors = {};
  const name = String(f.get('name') ?? '').trim();
  const phone = String(f.get('phone') ?? '').replace(/[\s-]/g, '');
  if (name.length < 2) e.name = 'Please enter your full name.';
  if (!/^(\+?91|0)?[6-9]\d{9}$/.test(phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (!f.get('goal')) e.goal = 'Choose a fitness goal.';
  if (!f.get('method')) e.method = 'Choose how you would like to be contacted.';
  return e;
}

export default function PreBook() {
  const id = useId();
  const card = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [firstName, setFirstName] = useState('');

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = new FormData(form);
    const e = validate(data);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    // PORTFOLIO DEMO: nothing is transmitted or stored. Wire an authorised backend + privacy policy before going live.
    setFirstName(String(data.get('name')).trim().split(/\s+/)[0]);
    setState('sending');
    setTimeout(() => {
      form.reset();
      setState('done');
    }, 1100);
  };

  const onMove = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} role="alert" className="mt-2 text-xs text-[#ff8a7f]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <section id="prebook" className="relative overflow-hidden bg-obsidian py-28 md:py-40">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <img src="/media/ground.webp" alt="" loading="lazy" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/70 to-obsidian" />
        <div className="absolute left-1/2 top-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.05] blur-[120px]" />
      </div>

      <div className="gutter relative mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-lime" /> Pre-booking
          </p>
          <SplitReveal
            lines={['Be first.', { text: 'Be stronger.', className: 'metal-text' }]}
            className="display text-[clamp(3.2rem,14vw,7rem)] lg:text-[min(7.2vw,8.5rem)]"
          />
          <p className="mt-8 max-w-md text-lg leading-relaxed text-silver">
            Register your interest in FC Gym Rohtak and stay informed about its upcoming launch.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-silver">
            {['Hear about the launch first', 'No payment, no commitment', 'Ask your questions before opening'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-lime/15 text-lime">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div
            ref={card}
            onPointerMove={onMove}
            className="glass relative overflow-hidden rounded-[28px] p-6 sm:p-9 md:p-11"
            style={{
              backgroundImage:
                'radial-gradient(420px circle at var(--mx,70%) var(--my,0%), rgba(198,255,0,0.08), transparent 60%), linear-gradient(140deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))',
            }}
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="eyebrow !text-bone">Register interest</p>
              <span className="rounded-full border border-lime/40 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-lime">
                Demo form
              </span>
            </div>

            <AnimatePresence mode="wait">
              {state !== 'done' ? (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                  aria-describedby={`${id}-note`}
                >
                  <div>
                    <label htmlFor={`${id}-name`} className="mb-2 block text-sm text-silver">Full name</label>
                    <input
                      id={`${id}-name`}
                      name="name"
                      autoComplete="name"
                      placeholder="Your full name"
                      className="field"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? `${id}-name-err` : undefined}
                    />
                    {err('name')}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`${id}-phone`} className="mb-2 block text-sm text-silver">Phone number</label>
                      <input
                        id={`${id}-phone`}
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+91 98XXX XXXXX"
                        className="field"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? `${id}-phone-err` : undefined}
                      />
                      {err('phone')}
                    </div>
                    <div>
                      <label htmlFor={`${id}-goal`} className="mb-2 block text-sm text-silver">Fitness goal</label>
                      <select
                        id={`${id}-goal`}
                        name="goal"
                        defaultValue=""
                        className="field"
                        aria-invalid={!!errors.goal}
                        aria-describedby={errors.goal ? `${id}-goal-err` : undefined}
                      >
                        <option value="" disabled>Select a goal</option>
                        {GOALS.map((g) => <option key={g}>{g}</option>)}
                      </select>
                      {err('goal')}
                    </div>
                  </div>
                  <fieldset aria-describedby={errors.method ? `${id}-method-err` : undefined}>
                    <legend className="mb-3 text-sm text-silver">Preferred contact method</legend>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {METHODS.map(({ v, label, Icon }) => (
                        <label key={v} className="group relative cursor-pointer">
                          <input type="radio" name="method" value={v} className="peer sr-only" />
                          <span className="flex h-full flex-col items-center gap-2 rounded-2xl border border-silver/15 bg-obsidian/40 px-2 py-4 text-center text-xs text-silver transition-all duration-300 group-hover:border-silver/35 peer-checked:border-lime peer-checked:bg-lime/[0.07] peer-checked:text-bone peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-lime sm:text-sm">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {err('method')}
                  </fieldset>

                  <Magnetic strength={0.15} className="w-full">
                    <button
                      type="submit"
                      disabled={state === 'sending'}
                      className="group btn-primary flex h-16 w-full items-center justify-between rounded-full pl-7 pr-2 text-[0.8rem] font-semibold uppercase tracking-[0.16em] disabled:opacity-80"
                    >
                      <span className="roll">
                        <span>{state === 'sending' ? 'Registering…' : 'Register your interest'}</span>
                        <span>{state === 'sending' ? 'Registering…' : 'Register your interest'}</span>
                      </span>
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-obsidian text-lime">
                        {state === 'sending' ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
                        )}
                      </span>
                    </button>
                  </Magnetic>
                  <p id={`${id}-note`} className="text-xs leading-relaxed text-silver/60">
                    Portfolio demo: submissions are simulated. No personal information is sent, stored or shared.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="done"
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="py-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime text-obsidian shadow-[0_0_60px_rgba(198,255,0,0.35)]"
                  >
                    <Check className="h-9 w-9" strokeWidth={2.5} />
                  </motion.div>
                  <p className="eyebrow mt-8 !text-lime">Demo confirmation</p>
                  <h3 className="display mt-3 text-[2.8rem] md:text-[3.4rem]">
                    You&apos;re on the list{firstName ? `, ${firstName}` : ''}.
                  </h3>
                  <p className="mx-auto mt-4 max-w-sm text-silver">
                    This is a simulated confirmation for a portfolio concept. Nothing was sent or stored — in a live
                    build, FC Gym would contact you using your preferred method.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setState('idle'); setErrors({}); }}
                    className="link-line mt-8 text-sm text-bone"
                  >
                    Submit another response
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
