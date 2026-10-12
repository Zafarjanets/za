import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Accent, clamp, PythonLogo, Title, usePop} from './components';
import {C, FONT, MONO} from './theme';
import {FPS, Item, sceneById, wordFrame} from './timeline';

const Stage: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 360}) => (
  <AbsoluteFill style={{alignItems: 'center', paddingTop: top, gap: 56, padding: `${top}px 70px 0`}}>
    {children}
  </AbsoluteFill>
);

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: C.card,
      border: `2px solid ${C.border}`,
      borderRadius: 36,
      boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(10px)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sceneById('hook');
  const p = usePop(0, 10);
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <Stage top={400}>
      <div style={{position: 'relative', transform: `scale(${p})`}}>
        <div style={{position: 'absolute', inset: -80, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,212,59,${0.25 + glow * 0.15}) 0%, transparent 65%)`}} />
        <PythonLogo size={460} spin={(1 - p) * -180 + Math.sin(frame / 20) * 4} />
      </div>
      <Title size={118} delay={wordFrame(s, 'Python')}>
        Что такое <Accent>Python</Accent>?
      </Title>
    </Stage>
  );
};

const LANGS = [
  {name: 'Python', w: 1, color: C.yellow},
  {name: 'C++', w: 0.62, color: C.blueLight},
  {name: 'Java', w: 0.55, color: C.blueLight},
  {name: 'JavaScript', w: 0.5, color: C.blueLight},
];

export const Popular: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sceneById('popular');
  const barsAt = wordFrame(s, 'популяр') - 6;
  return (
    <Stage>
      <Title size={92}>
        Один из самых <Accent>популярных</Accent> языков в мире
      </Title>
      <Card style={{width: 900, padding: '50px 50px', display: 'flex', flexDirection: 'column', gap: 34}}>
        {LANGS.map((l, i) => {
          const g = interpolate(frame, [barsAt + i * 4, barsAt + i * 4 + 22], [0, 1], {
            ...clamp,
            easing: (x) => 1 - Math.pow(1 - x, 3),
          });
          return (
            <div key={l.name} style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: 250, fontFamily: FONT, fontSize: 44, fontWeight: 700,
                color: i === 0 ? C.yellow : C.muted}}>{l.name}</div>
              <div style={{flex: 1, height: 54, borderRadius: 27, background: 'rgba(255,255,255,0.06)'}}>
                <div style={{height: '100%', width: `${l.w * g * 100}%`, borderRadius: 27, background: l.color,
                  boxShadow: i === 0 ? `0 0 40px ${C.yellow}88` : 'none'}} />
              </div>
              <div style={{width: 80, fontFamily: FONT, fontSize: 44, fontWeight: 800, color: C.yellow,
                opacity: i === 0 ? g : 0}}>#1</div>
            </div>
          );
        })}
      </Card>
    </Stage>
  );
};

export const History: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sceneById('history');
  const nameAt = wordFrame(s, 'Гвидо');
  const yearAt = wordFrame(s, '1991');
  const year = Math.round(interpolate(frame, [yearAt - 4, yearAt + 22], [1950, 1991], {
    ...clamp,
    easing: (x) => 1 - Math.pow(1 - x, 4),
  }));
  const card = usePop(nameAt - 4);
  const yearP = usePop(yearAt - 6);
  return (
    <Stage top={400}>
      <Title size={84}>Кто создал?</Title>
      <Card style={{width: 900, padding: 50, display: 'flex', alignItems: 'center', gap: 44,
        opacity: card, transform: `scale(${0.8 + card * 0.2})`}}>
        <div style={{width: 190, height: 190, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${C.blue}, ${C.yellow})`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 80, color: C.bg}}>
          GvR
        </div>
        <div style={{fontFamily: FONT}}>
          <div style={{fontSize: 62, fontWeight: 800, color: C.text, lineHeight: 1.1}}>Гвидо ван Россум</div>
          <div style={{fontSize: 42, color: C.muted, marginTop: 12}}>программист из Нидерландов</div>
        </div>
      </Card>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 260, color: C.yellow, letterSpacing: -8,
        opacity: yearP, transform: `scale(${0.6 + yearP * 0.4})`, textShadow: `0 0 80px ${C.yellow}66`}}>
        {year}
      </div>
    </Stage>
  );
};

export const Name: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sceneById('name');
  const snakeAt = wordFrame(s, 'змеи');
  const showAt = wordFrame(s, 'британ');
  const snake = usePop(snakeAt - 6);
  const cross = interpolate(frame, [snakeAt + 8, snakeAt + 18], [0, 1], clamp);
  const tv = usePop(showAt - 4);
  const emoji = {fontFamily: 'Noto Color Emoji', fontSize: 230, lineHeight: 1};
  return (
    <Stage top={420}>
      <Title size={88}>Откуда название?</Title>
      <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
        <Card style={{width: 400, height: 460, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 20, opacity: snake * (1 - cross * 0.4), transform: `scale(${snake})`, position: 'relative'}}>
          <div style={emoji}>🐍</div>
          <div style={{fontFamily: FONT, fontSize: 46, fontWeight: 700, color: C.muted}}>змея</div>
          <svg width="400" height="460" style={{position: 'absolute', inset: 0}}>
            <line x1="70" y1="70" x2={70 + 260 * cross} y2={70 + 320 * cross} stroke={C.red} strokeWidth="22" strokeLinecap="round" />
            <line x1="330" y1="70" x2={330 - 260 * cross} y2={70 + 320 * cross} stroke={C.red} strokeWidth="22" strokeLinecap="round" />
          </svg>
        </Card>
        <Card style={{width: 400, height: 460, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 20, opacity: tv, transform: `scale(${tv}) rotate(${(1 - tv) * 8}deg)`,
          border: `3px solid ${C.yellow}`}}>
          <div style={emoji}>📺</div>
          <div style={{fontFamily: FONT, fontSize: 46, fontWeight: 800, color: C.yellow, textAlign: 'center', lineHeight: 1.1}}>
            Monty<br />Python
          </div>
        </Card>
      </div>
      <div style={{fontFamily: FONT, fontSize: 44, color: C.muted, opacity: tv, textAlign: 'center'}}>
        британское комедийное шоу, 1969
      </div>
    </Stage>
  );
};

export const Simple: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sceneById('simple');
  const code = 'print("Привет, мир!")';
  const typeAt = wordFrame(s, 'Одна') - 4;
  const runAt = wordFrame(s, 'работает');
  const chars = Math.floor(interpolate(frame, [typeAt, typeAt + 26], [0, code.length], clamp));
  const shown = code.slice(0, chars);
  const out = usePop(runAt);
  const blink = Math.floor(frame / 8) % 2 === 0;
  const color = (str: string) => {
    // tiny highlighter: print, parens, string
    const m = str.match(/^(print)?(\(?)("[^"]*"?)?(\)?)$/);
    if (!m) return <span>{str}</span>;
    return (
      <>
        <span style={{color: '#7AB8FF'}}>{m[1]}</span>
        <span style={{color: C.text}}>{m[2]}</span>
        <span style={{color: '#B5E48C'}}>{m[3]}</span>
        <span style={{color: C.text}}>{m[4]}</span>
      </>
    );
  };
  return (
    <Stage top={400}>
      <Title size={90}>
        Простой и <Accent>понятный</Accent> код
      </Title>
      <Card style={{width: 940, overflow: 'hidden'}}>
        <div style={{display: 'flex', gap: 14, padding: '26px 30px', background: 'rgba(255,255,255,0.05)'}}>
          {['#FF5F56', '#FFBD2E', '#27C93F'].map((c) => (
            <div key={c} style={{width: 26, height: 26, borderRadius: '50%', background: c}} />
          ))}
          <div style={{marginLeft: 20, fontFamily: MONO, fontSize: 30, color: C.muted}}>hello.py</div>
        </div>
        <div style={{padding: '50px 44px', fontFamily: MONO, fontSize: 52, minHeight: 80}}>
          <span style={{color: C.muted, marginRight: 30}}>1</span>
          {color(shown)}
          <span style={{opacity: blink && frame < runAt ? 1 : 0, color: C.yellow}}>▌</span>
        </div>
        <div style={{borderTop: `2px solid ${C.border}`, padding: '34px 44px', fontFamily: MONO, fontSize: 44,
          color: C.green, opacity: out, transform: `translateY(${(1 - out) * 20}px)`}}>
          <span style={{color: C.muted}}>{'>>> '}</span>Привет, мир!
        </div>
      </Card>
    </Stage>
  );
};

const Chart: React.FC = () => (
  <svg width="70" height="70" viewBox="0 0 70 70">
    {[20, 38, 28, 56].map((h, i) => (
      <rect key={i} x={4 + i * 16} y={66 - h} width="11" height={h} rx="3" fill={C.yellow} />
    ))}
  </svg>
);

const UseCard: React.FC<{item: Item; at: number}> = ({item, at}) => {
  const p = usePop(at, 11);
  return (
    <Card style={{display: 'flex', alignItems: 'center', gap: 34, padding: '30px 40px', width: 880,
      opacity: Math.min(p * 1.4, 1), transform: `translateX(${(1 - p) * -120}px) scale(${0.9 + p * 0.1})`}}>
      <div style={{width: 110, height: 110, borderRadius: 28, background: `${C.blue}55`, flexShrink: 0,
        border: `2px solid ${C.blueLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: MONO, fontWeight: 700, fontSize: item.icon === '⚙' ? 70 : 38, color: C.yellow}}>
        {item.icon === 'chart' ? <Chart /> : item.icon}
      </div>
      <div style={{fontFamily: FONT, fontSize: 54, fontWeight: 800, color: C.text}}>{item.label}</div>
    </Card>
  );
};

export const Uses: React.FC = () => {
  const s = sceneById('uses');
  return (
    <Stage top={260}>
      <Title size={88}>Что на нём делают?</Title>
      <div style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: -10}}>
        {s.items!.map((it) => (
          <UseCard key={it.label} item={it} at={Math.round((it.at - s.start) * FPS) - 3} />
        ))}
      </div>
    </Stage>
  );
};

const Chip: React.FC<{item: Item; at: number}> = ({item, at}) => {
  const p = usePop(at, 9);
  return (
    <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 66, color: '#fff', padding: '30px 46px',
      borderRadius: 999, background: item.color, boxShadow: `0 20px 60px ${item.color}66`,
      opacity: Math.min(p * 1.5, 1), transform: `scale(${p})`}}>
      {item.label}
    </div>
  );
};

export const Who: React.FC = () => {
  const s = sceneById('who');
  return (
    <Stage top={440}>
      <Title size={88}>
        Кто использует <Accent>Python</Accent>?
      </Title>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 34, width: 940}}>
        {s.items!.map((it) => (
          <Chip key={it.label} item={it} at={Math.round((it.at - s.start) * FPS) - 3} />
        ))}
      </div>
    </Stage>
  );
};

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sceneById('cta');
  const startAt = wordFrame(s, 'Начни');
  const p = usePop(startAt - 4, 9);
  const logo = usePop(0, 12);
  const pulse = 1 + Math.sin(frame / 6) * 0.02;
  return (
    <Stage top={380}>
      <div style={{transform: `scale(${logo}) rotate(${frame * 0.4}deg)`}}>
        <PythonLogo size={340} />
      </div>
      <Title size={80}>Хочешь в программирование?</Title>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 104, whiteSpace: 'nowrap', padding: '30px 60px', borderRadius: 40,
        background: `linear-gradient(135deg, ${C.yellow}, #FFB300)`, color: C.bg, letterSpacing: -3,
        boxShadow: `0 0 90px ${C.yellow}88`, opacity: p, transform: `scale(${p * pulse})`}}>
        Начни с Python!
      </div>
    </Stage>
  );
};
