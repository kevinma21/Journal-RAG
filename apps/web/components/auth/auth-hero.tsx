'use client';

import { useEffect, useState } from 'react';

const phrases = [
  'Understand yourself.',
  'Remember what matters.',
  'Find your patterns.',
  'Rediscover your memories.',
];

const steps = [
  {
    label: 'Capture',
    description: 'Write down what happened.',
  },
  {
    label: 'Retrieve',
    description: 'Find memories when you need them.',
  },
  {
    label: 'Reflect',
    description: 'Understand patterns over time.',
  },
];

const TYPE_SPEED = 110;
const DELETE_SPEED = 80;
const HOLD_DURATION = 3000;

export function AuthHero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const phrase = phrases[phraseIndex];

  /*
   * The typewriter drives the step indicator.
   *
   * phrase 0 → Capture
   * phrase 1 → Retrieve
   * phrase 2 → Reflect
   * phrase 3 → Capture
   */
  const activeStep = phraseIndex % steps.length;
  const activeDescription = steps[activeStep].description;

  useEffect(() => {
    const isComplete = displayedText === phrase;
    const isEmpty = displayedText === '';

    let delay = TYPE_SPEED;

    if (deleting) {
      delay = isEmpty ? 0 : DELETE_SPEED;
    } else if (isComplete) {
      delay = HOLD_DURATION;
    }

    const timer = window.setTimeout(() => {
      if (deleting) {
        if (isEmpty) {
          setDeleting(false);
          setPhraseIndex((current) => (current + 1) % phrases.length);
          return;
        }

        setDisplayedText((current) => current.slice(0, -1));
        return;
      }

      if (isComplete) {
        setDeleting(true);
        return;
      }

      setDisplayedText((current) =>
        phrase.slice(0, current.length + 1),
      );
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [displayedText, deleting, phrase]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-[20%] top-[20%] h-[60%] w-[70%] rounded-full bg-brand-500/10 blur-[120px]" />

        <div className="absolute bottom-[20%] right-[5%] h-[55%] w-[65%] rounded-full bg-brand-400/10 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Decorative lines */}
      <div className="absolute left-[-10%] top-[18%] h-px w-[120%] rotate-[-10deg] bg-linear-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="absolute bottom-[18%] left-[-5%] h-px w-[110%] -rotate-12 bg-linear-to-r from-transparent via-brand-400/40 to-transparent" />

      {/* Hero content */}
      <div className="relative flex h-full items-center px-10 xl:px-16">
        <div className="mx-auto w-full max-w-200">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-subtle/50 bg-bg-primary/50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />

            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
              Your personal memory
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl font-bold leading-[1.1] tracking-[-0.035em] text-text-primary xl:text-[52px]">
            <span className="block">Capture your day.</span>

            <span className="block">Retrieve what matters.</span>

            {/* Fixed-height typewriter line */}
            <span className="mt-1 block h-[1.1em] overflow-hidden text-brand-400">
              <span className="inline-flex whitespace-nowrap">
                {displayedText}

                <span
                  className="ml-1 inline-block animate-[blink_1.2s_step-end_infinite]"
                  aria-hidden="true"
                >
                  |
                </span>
              </span>
            </span>
          </h2>

          {/* Description */}
          <p className="mt-7 max-w-125 text-base leading-7 text-text-secondary">
            A calm, intelligent space to write, search, and rediscover your
            memories.
          </p>

          {/* Animated journey */}
          <div className="mt-10 max-w-140">
            {/* Progress line */}
            <div className="relative flex items-center">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;

                return (
                  <div
                    key={step.label}
                    className="flex flex-1 items-center"
                  >
                    {/* Step */}
                    <div
                      className={[
                        'relative z-10 flex items-center gap-2 rounded-full px-3 py-2',
                        'transition-all duration-500 ease-out',
                        isActive
                          ? 'bg-brand-500/10'
                          : 'bg-transparent',
                      ].join(' ')}
                    >
                      {/* Indicator */}
                      <span
                        className={[
                          'h-2 w-2 rounded-full transition-all duration-300',
                          isActive
                            ? 'bg-brand-400 shadow-[0_0_12px_rgba(99,102,241,0.75)]'
                            : isCompleted
                              ? 'bg-brand-500/60'
                              : 'bg-text-tertiary/50',
                        ].join(' ')}
                      />

                      {/* Label */}
                      <span
                        className={[
                          'text-sm font-medium transition-colors duration-300',
                          isActive
                            ? 'text-text-primary'
                            : 'text-text-tertiary',
                        ].join(' ')}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className="mx-1 h-px flex-1 overflow-hidden bg-border-subtle">
                        <div
                          className={[
                            'h-full origin-left bg-brand-500',
                            'transition-transform duration-700 ease-out',
                            index < activeStep
                              ? 'scale-x-100'
                              : 'scale-x-0',
                          ].join(' ')}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Animated description */}
            <div className="mt-3 h-5 overflow-hidden">
              <p
                key={activeStep}
                className="text-xs text-text-tertiary animate-[stepFade_300ms_ease-out]"
              >
                {activeDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }

          51%,
          100% {
            opacity: 0;
          }
        }

        @keyframes stepFade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}