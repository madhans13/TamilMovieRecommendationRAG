import { useState, useRef, useEffect } from 'react'
import axios from 'axios';

const OMDB_API_KEY = 'trilogy';

async function fetchPoster(title, year) {
  try {
    const params = new URLSearchParams({ apikey: OMDB_API_KEY, t: title, type: 'movie' });
    if (year) params.set('y', year);
    const res = await fetch(`https://www.omdbapi.com/?${params}`);
    const data = await res.json();
    if (data.Poster && data.Poster !== 'N/A') return data.Poster;
  } catch { }
  return null;
}

function StarRating({ rating }) {
  const stars = Math.round(rating / 2);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= stars ? '#f5c518' : 'rgba(245,197,24,0.2)'}
          stroke={i <= stars ? '#f5c518' : 'rgba(245,197,24,0.3)'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ color: '#f5c518', fontSize: '13px', fontWeight: '700', marginLeft: '6px' }}>{rating}</span>
    </div>
  );
}

// ─── Cinematic Loading Screen ───────────────────────────────────────────────

const LOADING_LINES = [
  "Scanning the archives...",
  "Consulting the auteurs...",
  "Mapping your taste...",
  "Curating your cinema...",
  "Weighing the performances...",
  "Reading between the frames...",
  "Almost ready for you...",
];

function FilmStrip({ direction }) {
  return (
    <div style={{
      position: 'absolute',
      [direction === 'top' ? 'top' : 'bottom']: 0,
      left: 0, right: 0, height: '52px',
      background: '#0a0a0a',
      borderTop: direction === 'bottom' ? '1px solid #111' : 'none',
      borderBottom: direction === 'top' ? '1px solid #111' : 'none',
      display: 'flex', alignItems: 'center', overflow: 'hidden', zIndex: 1,
    }}>
      <div style={{
        display: 'flex', gap: '4px',
        animation: `${direction === 'top' ? 'filmScrollLeft' : 'filmScrollRight'} 8s linear infinite`,
        willChange: 'transform',
      }}>
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <div style={{ width: '12px', height: '8px', borderRadius: '1px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <div style={{ width: '36px', height: '36px', borderRadius: '3px', flexShrink: 0, background: i % 5 === 0 ? 'rgba(229,9,20,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} />
            <div style={{ width: '12px', height: '8px', borderRadius: '1px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CinematicLoader({ visible }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [filmProgress, setFilmProgress] = useState(0);
  const [flicker, setFlicker] = useState(true);

  useEffect(() => {
    if (!visible) { setLineIndex(0); setFilmProgress(0); return; }

    const lineTimer = setInterval(() => setLineIndex(i => (i + 1) % LOADING_LINES.length), 1800);
    const progressTimer = setInterval(() => setFilmProgress(p => p >= 90 ? p : Math.min(90, p + Math.random() * 5 + 1)), 220);
    const flickerTimer = setInterval(() => { setFlicker(false); setTimeout(() => setFlicker(true), 55); }, 4000);

    return () => { clearInterval(lineTimer); clearInterval(progressTimer); clearInterval(flickerTimer); };
  }, [visible]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: '#030303',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'all' : 'none', transition: 'opacity 0.5s ease',
    }}>
      <FilmStrip direction="top" />
      <FilmStrip direction="bottom" />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        opacity: flicker ? 1 : 0.6, transition: 'opacity 0.04s',
      }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 40px' }}>
        <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 32px' }}>
          <div style={{ position: 'absolute', inset: '-14px', borderRadius: '50%', border: '1px solid rgba(229,9,20,0.12)', animation: 'pulseRing 2.4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '1px solid rgba(229,9,20,0.22)', animation: 'pulseRing 2.4s ease-in-out infinite 0.4s' }} />
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #0d0d0d 0deg, #1c0404 45deg, #0d0d0d 90deg, #1c0404 135deg, #0d0d0d 180deg, #1c0404 225deg, #0d0d0d 270deg, #1c0404 315deg, #0d0d0d 360deg)',
            animation: 'rotateLens 10s linear infinite', border: '1.5px solid rgba(229,9,20,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 38%, #2a0505 0%, #100202 50%, #000 100%)',
              border: '1.5px solid rgba(229,9,20,0.5)',
              boxShadow: '0 0 24px rgba(229,9,20,0.25), inset 0 0 12px rgba(229,9,20,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e50914', boxShadow: '0 0 10px #e50914, 0 0 22px rgba(229,9,20,0.6)', animation: 'beamPulse 1.1s ease-in-out infinite' }} />
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontSize: '44px', fontWeight: '900',
          background: 'linear-gradient(135deg, #fff 0%, #777 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '8px', lineHeight: 1, opacity: flicker ? 1 : 0.82, transition: 'opacity 0.04s',
        }}>CineMatch</div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.2)',
          borderRadius: '20px', padding: '5px 16px', marginBottom: '40px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e50914', animation: 'beamPulse 0.9s ease-in-out infinite' }} />
          <span style={{ fontSize: '9px', color: '#e50914', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Live</span>
        </div>

        <div style={{ height: '18px', overflow: 'hidden', position: 'relative', marginBottom: '36px' }}>
          {LOADING_LINES.map((line, i) => (
            <p key={line} style={{
              position: 'absolute', width: '100%', left: 0,
              fontSize: '11px', color: 'rgba(255,255,255,0.3)',
              letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '500',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              opacity: i === lineIndex ? 1 : 0,
              transform: i === lineIndex ? 'translateY(0px)' : i < lineIndex ? 'translateY(-10px)' : 'translateY(10px)',
            }}>{line}</p>
          ))}
        </div>

        <div style={{ width: '240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ width: '10px', height: '6px', borderRadius: '1px', background: (i / 9) * 100 <= filmProgress ? 'rgba(229,9,20,0.55)' : 'rgba(255,255,255,0.04)', transition: 'background 0.3s ease' }} />
            ))}
          </div>
          <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #7f0008, #e50914, #ff6b6b)', transformOrigin: 'left', transform: `scaleX(${filmProgress / 100})`, transition: 'transform 0.3s ease', boxShadow: '0 0 10px rgba(229,9,20,0.7)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ width: '10px', height: '6px', borderRadius: '1px', background: (i / 9) * 100 <= filmProgress ? 'rgba(229,9,20,0.55)' : 'rgba(255,255,255,0.04)', transition: 'background 0.3s ease' }} />
            ))}
          </div>
        </div>

        <p style={{ marginTop: '20px', fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.1)', letterSpacing: '3px' }}>
          {String(Math.floor(filmProgress * 2.4)).padStart(4, '0')} / 0240
        </p>
      </div>
    </div>
  );
}

// ─── Individual Movie Card ──────────────────────────────────────────────────

function MovieCard({ movie, ghost = false }) {
  const [poster, setPoster] = useState(undefined);

  useEffect(() => {
    setPoster(undefined);
    let cancelled = false;
    fetchPoster(movie.title, movie.year).then(url => {
      if (!cancelled) setPoster(url ?? null);
    });
    return () => { cancelled = true; };
  }, [movie.title, movie.year]);

  const hasPoster = !!poster;
  const isLoading = poster === undefined;

  return (
    <div style={{
      width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden',
      background: hasPoster ? 'transparent' : 'linear-gradient(145deg, #111 0%, #0d0d0d 100%)',
      border: '1px solid #1e1e1e', position: 'relative',
      boxShadow: ghost ? 'none' : '0 30px 60px rgba(0,0,0,0.8)',
    }}>
      {isLoading ? (
        <div style={{ width: '100%', height: '60%', background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #1a1a1a', borderTop: '3px solid #e50914', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : hasPoster ? (
        <img src={poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }} draggable={false} />
      ) : (
        <div style={{ width: '100%', height: '60%', background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px', opacity: 0.3 }}>🎬</div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: hasPoster
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.97) 100%)'
          : 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.98) 70%)',
        pointerEvents: 'none'
      }} />

      {movie.score && !ghost && (
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'linear-gradient(135deg, #e50914, #b00610)',
          borderRadius: '20px', padding: '5px 12px',
          fontSize: '12px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px', zIndex: 2,
          boxShadow: '0 4px 12px rgba(229,9,20,0.4)'
        }}>{(movie.score * 100).toFixed(0)}% match</div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {(movie.genre || []).slice(0, 3).map(g => (
            <span key={g} style={{
              background: 'rgba(229,9,20,0.25)', border: '1px solid rgba(229,9,20,0.5)',
              backdropFilter: 'blur(8px)', borderRadius: '4px', padding: '2px 8px',
              fontSize: '9px', color: '#ff6b6b', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase'
            }}>{g}</span>
          ))}
        </div>

        <h2 style={{
          margin: '0 0 4px 0', fontSize: '26px', fontWeight: '900', color: '#fff',
          fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)'
        }}>{movie.title}</h2>

        <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: '500' }}>
          {movie.year}{movie.director ? ` · ${movie.director}` : ''}
        </p>

        <StarRating rating={movie.rating} />

        {movie.similarity && !ghost && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Similarity</span>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{(movie.similarity * 100).toFixed(1)}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '3px', height: '3px' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #e50914, #ff6b6b)', width: `${movie.similarity * 100}%`, transition: 'width 1.2s ease' }} />
            </div>
          </div>
        )}

        {movie.why_recommended && !ghost && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{ width: '14px', height: '1px', background: 'rgba(229,9,20,0.5)' }} />
              <span style={{ fontSize: '8px', color: 'rgba(229,9,20,0.7)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Why it's for you
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(229,9,20,0.15)' }} />
            </div>
            <p style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65,
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              fontStyle: 'italic',
            }}>{movie.why_recommended}</p>
          </div>
        )}

        {!movie.why_recommended && movie.summary && !ghost && (
          <p style={{
            marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>{movie.summary}</p>
        )}
      </div>
    </div>
  );
}

// ─── Swipe Card Stack ───────────────────────────────────────────────────────

const FLY_DISTANCE = 650;
const ANIM_MS = 300;

function SwipeStack({ movies }) {
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDir, setFlyDir] = useState(null);
  const startRef = useRef(null);
  const cardRef = useRef(null);
  const animatingRef = useRef(false);
  const THRESHOLD = 100;

  function dismiss(dir) {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setIsDragging(false); setDragX(0); setDragY(0); setFlyDir(dir);
    setTimeout(() => { setCurrent(c => c + 1); setFlyDir(null); animatingRef.current = false; }, ANIM_MS);
  }

  function undo() { if (!animatingRef.current) setCurrent(c => Math.max(0, c - 1)); }
  function goNext() { if (current < movies.length - 1) dismiss('left'); }

  function onPointerDown(e) {
    if (animatingRef.current) return;
    setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY };
    cardRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!isDragging || !startRef.current) return;
    setDragX(e.clientX - startRef.current.x);
    setDragY((e.clientY - startRef.current.y) * 0.3);
  }
  function onPointerUp() {
    if (!isDragging) return;
    setIsDragging(false); startRef.current = null;
    if (Math.abs(dragX) > THRESHOLD) dismiss(dragX > 0 ? 'right' : 'left');
    else { setDragX(0); setDragY(0); }
  }

  let tx = dragX, ty = dragY, rot = dragX / 18;
  let transition = isDragging ? 'none' : `transform ${ANIM_MS}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
  if (flyDir === 'left') { tx = -FLY_DISTANCE; ty = 60; rot = -25; transition = `transform ${ANIM_MS}ms cubic-bezier(0.55, 0, 1, 0.45)`; }
  else if (flyDir === 'right') { tx = FLY_DISTANCE; ty = 60; rot = 25; transition = `transform ${ANIM_MS}ms cubic-bezier(0.55, 0, 1, 0.45)`; }

  const likeOpacity = flyDir === 'right' ? 1 : Math.min(1, Math.max(0, dragX / 80));
  const nopeOpacity = flyDir === 'left' ? 1 : Math.min(1, Math.max(0, -dragX / 80));
  const dragProgress = Math.min(1, Math.abs(flyDir ? FLY_DISTANCE : dragX) / FLY_DISTANCE);
  const nextScale = 0.94 + dragProgress * 0.06;
  const nextTranslateY = Math.max(0, 14 - dragProgress * 14);
  const nextBrightness = 0.6 + dragProgress * 0.4;

  const active = movies[current];
  const next = movies[current + 1];
  const afterNext = movies[current + 2];

  if (current >= movies.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '520px', gap: '16px' }}>
        <div style={{ fontSize: '64px' }}>🎬</div>
        <p style={{ color: '#555', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>That's a wrap!</p>
        <p style={{ color: '#333', fontSize: '13px' }}>All {movies.length} recommendations reviewed</p>
        <button onClick={() => setCurrent(0)} style={{
          marginTop: '8px', background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)',
          borderRadius: '8px', padding: '10px 20px', color: '#e50914',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase'
        }}>↺ Review Again</button>
      </div>
    );
  }

  const navBtn = (onClick, disabled, children, title) => (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      width: '48px', height: '48px', borderRadius: '50%',
      border: `2px solid ${disabled ? '#161616' : '#1e1e1e'}`,
      background: disabled ? 'transparent' : 'rgba(255,255,255,0.04)',
      color: disabled ? '#161616' : '#555',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = disabled ? '#161616' : '#1e1e1e'; e.currentTarget.style.color = disabled ? '#161616' : '#555'; e.currentTarget.style.background = disabled ? 'transparent' : 'rgba(255,255,255,0.04)'; }}
    >{children}</button>
  );

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
        {movies.map((_, i) => (
          <div key={i} style={{
            width: i === current ? '24px' : '6px', height: '6px', borderRadius: '3px',
            background: i < current ? '#2a2a2a' : i === current ? '#e50914' : '#1a1a1a',
            transition: 'all 0.3s ease'
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', height: '560px' }}>
        {afterNext && (
          <div key={`ghost2-${afterNext.title}`} style={{
            position: 'absolute', inset: 0, transform: 'scale(0.88) translateY(24px)',
            transformOrigin: 'bottom center', zIndex: 1, borderRadius: '24px', overflow: 'hidden',
            filter: 'brightness(0.4)', pointerEvents: 'none'
          }}>
            <MovieCard key={afterNext.title} movie={afterNext} ghost />
          </div>
        )}
        {next && (
          <div key={`ghost1-${next.title}`} style={{
            position: 'absolute', inset: 0,
            transform: `scale(${nextScale}) translateY(${nextTranslateY}px)`,
            transformOrigin: 'bottom center', zIndex: 2, borderRadius: '24px', overflow: 'hidden',
            filter: `brightness(${nextBrightness})`,
            transition: isDragging ? 'none' : `all ${ANIM_MS}ms ease`, pointerEvents: 'none'
          }}>
            <MovieCard key={next.title} movie={next} ghost />
          </div>
        )}
        <div key={`active-${active.title}`} ref={cardRef}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          style={{
            position: 'absolute', inset: 0,
            transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`,
            transition, zIndex: 10,
            cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none'
          }}>
          <div style={{
            position: 'absolute', top: '28px', left: '28px', zIndex: 20,
            border: '4px solid #22c55e', borderRadius: '8px', padding: '6px 14px',
            transform: 'rotate(-15deg)', opacity: likeOpacity, pointerEvents: 'none',
            transition: isDragging ? 'none' : 'opacity 0.15s'
          }}>
            <span style={{ color: '#22c55e', fontWeight: '900', fontSize: '22px', letterSpacing: '2px' }}>LIKE</span>
          </div>
          <div style={{
            position: 'absolute', top: '28px', right: '28px', zIndex: 20,
            border: '4px solid #e50914', borderRadius: '8px', padding: '6px 14px',
            transform: 'rotate(15deg)', opacity: nopeOpacity, pointerEvents: 'none',
            transition: isDragging ? 'none' : 'opacity 0.15s'
          }}>
            <span style={{ color: '#e50914', fontWeight: '900', fontSize: '22px', letterSpacing: '2px' }}>SKIP</span>
          </div>
          <MovieCard key={active.title} movie={active} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px', alignItems: 'center' }}>
        {navBtn(undo, current === 0,
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
          'Previous card'
        )}
        <button onClick={() => dismiss('left')} title="Skip" style={{
          width: '60px', height: '60px', borderRadius: '50%',
          border: '2px solid rgba(229,9,20,0.4)', background: 'rgba(229,9,20,0.08)',
          color: '#e50914', fontSize: '22px', cursor: 'pointer',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,9,20,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(229,9,20,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}>✕</button>
        <button onClick={undo} disabled={current === 0} title="Undo" style={{
          width: '44px', height: '44px', borderRadius: '50%',
          border: '2px solid #1e1e1e', background: 'rgba(255,255,255,0.02)',
          color: current === 0 ? '#1e1e1e' : '#444', fontSize: '16px',
          cursor: current === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
          onMouseEnter={e => { if (current > 0) { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#777'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = current === 0 ? '#1e1e1e' : '#444'; }}>↩</button>
        <button onClick={() => dismiss('right')} title="Like" style={{
          width: '60px', height: '60px', borderRadius: '50%',
          border: '2px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.08)',
          color: '#22c55e', fontSize: '22px', cursor: 'pointer',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}>♥</button>
        {navBtn(goNext, current >= movies.length - 1,
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
          'Next card'
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#2a2a2a', fontSize: '11px', marginTop: '16px', letterSpacing: '1px' }}>
        SWIPE OR USE BUTTONS · {movies.length - current} LEFT
      </p>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ✅ FIX: Use onSubmit instead of action prop so setLoading(true) fires
  // before the async work begins and triggers the loader immediately.
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const movie = formData.get('movie');
    const reason = formData.get('reason');
    if (!movie.trim() || !reason.trim()) { setError('Please fill in both fields.'); return; }
    setError('');
    setLoading(true);
    setSubmitted(true);
    setRecommendations([]);
    try {
      const response = await axios.post('http://localhost:3000/movie', { movie, reason });
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Check your movie titles.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060606; color: #fff; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(229,9,20,0.3); } 50% { box-shadow: 0 0 40px rgba(229,9,20,0.6); } }
        @keyframes rotateLens { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes beamPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.75); } }
        @keyframes pulseRing { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.12; } }
        @keyframes filmScrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes filmScrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        input[type="text"], textarea {
          width: 100%; background: #0e0e0e; border: 1px solid #1e1e1e; border-radius: 10px;
          padding: 14px 16px; color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 15px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; resize: none;
        }
        input[type="text"]:focus, textarea:focus { border-color: #e50914; box-shadow: 0 0 0 3px rgba(229,9,20,0.1); }
        input::placeholder, textarea::placeholder { color: #2a2a2a; }
        button[type="submit"] {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #e50914 0%, #b00610 100%);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; letter-spacing: 1px; text-transform: uppercase; transition: all 0.2s;
        }
        button[type="submit"]:hover { transform: translateY(-1px); animation: pulseGlow 1.5s infinite; }
        label { display: block; font-size: 10px; font-weight: 700; color: #444; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 3px; }
      `}</style>

      <CinematicLoader visible={loading} />

      <div style={{
        maxWidth: '520px', margin: '0 auto', padding: '60px 20px 100px',
        opacity: loading ? 0 : 1, transition: 'opacity 0.4s ease',
        pointerEvents: loading ? 'none' : 'auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeSlideIn 0.5s ease forwards' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.18)',
            borderRadius: '20px', padding: '4px 14px', marginBottom: '18px',
            fontSize: '10px', color: '#e50914', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: '700'
          }}>AI Powered</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 8vw, 68px)',
            fontWeight: '900', lineHeight: 1.05,
            background: 'linear-gradient(135deg, #fff 0%, #666 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px'
          }}>CineMatch</h1>
          <p style={{ color: '#333', fontSize: '14px', lineHeight: 1.7, maxWidth: '300px', margin: '0 auto' }}>
            Tell us what you loved.<br />We'll find what you'll love next.
          </p>
        </div>

        {!submitted && (
          // ✅ FIX: Changed from action={submitHandler} to onSubmit={handleSubmit}
          // The `action` prop pattern (React 19 Server Actions) doesn't guarantee
          // that state updates like setLoading(true) flush to the DOM before the
          // async work begins, so the loading animation never appeared.
          <form onSubmit={handleSubmit} style={{
            background: '#0d0d0d', border: '1px solid #161616', borderRadius: '18px', padding: '28px',
            animation: 'fadeSlideIn 0.5s ease 0.1s forwards', opacity: 0
          }}>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label>Movies you've enjoyed</label>
                <input type="text" name="movie" placeholder="Vikram, Kaithi, Vikram Vedha" />
                <p style={{ marginTop: '6px', fontSize: '11px', color: '#222', lineHeight: 1.5 }}>Separate multiple titles with commas</p>
              </div>
              <div>
                <label>Why did you like them?</label>
                <textarea name="reason" rows={3} placeholder="I loved the dark thriller vibe, intense action, morally complex characters..." />
              </div>
              {error && (
                <div style={{ background: 'rgba(229,9,20,0.06)', border: '1px solid rgba(229,9,20,0.2)', borderRadius: '8px', padding: '12px 16px', color: '#e50914', fontSize: '13px' }}>⚠ {error}</div>
              )}
              <button type="submit">→ Find My Movies</button>
            </div>
          </form>
        )}

        {submitted && !loading && (
          <button onClick={() => { setSubmitted(false); setRecommendations([]); setError(''); }} style={{
            background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px',
            padding: '10px 20px', color: '#444', fontSize: '12px', fontWeight: '600',
            cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
            display: 'block', margin: '0 auto 32px', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#666'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#444'; }}
          >← New Search</button>
        )}

        {!loading && recommendations.length > 0 && (
          <div style={{ animation: 'fadeSlideIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '800', color: '#fff' }}>For You</h2>
                <p style={{ fontSize: '11px', color: '#333', marginTop: '3px', letterSpacing: '1px' }}>SWIPE RIGHT TO SAVE · LEFT TO SKIP</p>
              </div>
              <span style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#e50914', fontWeight: '700' }}>{recommendations.length} picks</span>
            </div>
            <SwipeStack movies={recommendations} />
          </div>
        )}

        {!loading && submitted && recommendations.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</p>
            <p style={{ fontSize: '14px', color: '#333' }}>No recommendations found. Try different movie titles.</p>
          </div>
        )}

        {error && submitted && !loading && (
          <div style={{ background: 'rgba(229,9,20,0.06)', border: '1px solid rgba(229,9,20,0.2)', borderRadius: '8px', padding: '12px 16px', color: '#e50914', fontSize: '13px', textAlign: 'center' }}>⚠ {error}</div>
        )}
      </div>
    </>
  );
}