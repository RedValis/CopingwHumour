import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const EYE_W = 270, EYE_H = 148, IRIS_R = 95, CONSTRAINT_RX = 148, CONSTRAINT_RY = 42;
const EYE_PATH = `M -${EYE_W},0 Q 0,-${EYE_H} ${EYE_W},0 Q 0,${EYE_H} -${EYE_W},0 Z`;
const SERIF = "'Didot', 'Bodoni MT', 'Playfair Display', serif";
const SECTIONS = ["home","problem","research","results","implication","action"];

// ─── useOnScreen ──────────────────────────────────────────────────────────────
const useOnScreen = (delay = 0) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.unobserve(e.target); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return [ref, visible];
};

// ─── FadeIn ───────────────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useOnScreen(delay);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease-out, transform 0.8s ease-out", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {children}
    </div>
  );
};

// ─── Para: FadeIn + styled <p> ────────────────────────────────────────────────
const Para = ({ delay = 200, color = "rgba(255,255,255,0.75)", mb = "2rem", maxWidth = "700px", children }) => (
  <FadeIn delay={delay}>
    <p style={{ fontFamily: SERIF, fontSize: "clamp(1.1rem,2vw,1.35rem)", color, lineHeight: 1.8, marginBottom: mb, maxWidth }}>{children}</p>
  </FadeIn>
);

// ─── Separator ────────────────────────────────────────────────────────────────
const Sep = ({ mt = "2rem", mb = "8rem" }) => (
  <FadeIn delay={100}>
    <div style={{ marginTop: mt, width: "100%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", marginBottom: mb }} />
  </FadeIn>
);

// ─── AnimatedBarChart ─────────────────────────────────────────────────────────
const AnimatedBarChart = ({ data }) => {
  const [ref, visible] = useOnScreen();
  return (
    <div ref={ref} style={{ display: "flex", gap: "2rem", justifyContent: "center", alignItems: "flex-end", height: "180px", marginTop: "2rem", marginBottom: "4rem" }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "80px" }}>
          <div style={{ height: "120px", width: "40px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: visible ? `${item.value}%` : "0%", background: item.color || "#fff", transition: `height 1s cubic-bezier(0.22,1,0.36,1) ${i * 0.15 + 0.2}s` }} />
          </div>
          <div style={{ marginTop: "1rem", fontFamily: "monospace", fontSize: "1.1rem", color: item.color || "#fff", fontWeight: "bold" }}>{item.value}%</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "0.4rem", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── KeyFinding ───────────────────────────────────────────────────────────────
const KeyFinding = ({ label, title, desc, chart, mb = "6rem" }) => (
  <FadeIn delay={200}>
    <div style={{ marginBottom: mb, width: "100%" }}>
      <h3 style={{ color: "white", fontSize: "0.9rem", letterSpacing: "0.15em", marginBottom: "1rem", fontFamily: "'Inter',sans-serif" }}>
      </h3>
      <p style={{ fontSize: "1.6rem", color: "white", fontFamily: SERIF, marginBottom: "1rem" }}>{title}</p>
      <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, margin: "0 auto 2rem auto", maxWidth: "700px" }}>{desc}</p>
      {chart}
    </div>
  </FadeIn>
);

// ─── StaticEye ────────────────────────────────────────────────────────────────
const StaticEye = () => (
  <svg width="1.2em" viewBox="-350 -200 700 400" style={{ overflow: "visible", display: "inline-block", verticalAlign: "middle", margin: "0 0.5rem" }} aria-hidden="true">
    <defs><clipPath id="staticEyeClip"><path d={EYE_PATH} /></clipPath></defs>
    <path d={EYE_PATH} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="12" />
    <g clipPath="url(#staticEyeClip)"><circle cx={0} cy={0} r={IRIS_R * 0.8} fill="rgba(255,255,255,0.8)" /></g>
  </svg>
);

// ─── SectionHead: anchor scroll target + eye + h2 ────────────────────────────
const SectionHead = ({ id, children, mb = "3.5rem" }) => (
  <>
    <div id={`section-${id}`} style={{ position: "relative", top: "-15vh" }} />
    <FadeIn delay={100}>
      <div id={`eye-${id}`} style={{ marginBottom: "1.5rem" }}><StaticEye /></div>
      <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, letterSpacing: "0.05em", color: "white", marginBottom: mb, lineHeight: 1.2 }}>{children}</h2>
    </FadeIn>
  </>
);

// ─── MiniEye (cursor-tracking, used in logo) ──────────────────────────────────
const MiniEye = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const angle = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    setPos({ x: Math.cos(angle) * 70, y: Math.sin(angle) * 20 });
  }, []);
  useEffect(() => { window.addEventListener("mousemove", onMove); return () => window.removeEventListener("mousemove", onMove); }, [onMove]);
  return (
    <svg ref={ref} width="1.8em" viewBox="-350 -200 700 400" style={{ overflow: "visible", display: "inline-block", verticalAlign: "middle", margin: "0 0.1rem" }} aria-hidden="true">
      <defs><clipPath id="miniEyeClip"><path d={EYE_PATH} /></clipPath></defs>
      <path d={EYE_PATH} fill="white" />
      <g clipPath="url(#miniEyeClip)"><circle cx={0} cy={0} r={IRIS_R} fill="black" style={{ transform: `translate(${pos.x}px,${pos.y}px)`, transition: "transform 0.05s linear" }} /></g>
    </svg>
  );
};

// ─── SidebarTOC ───────────────────────────────────────────────────────────────
const LINKS = [
  { id: "home",        label: "Home" },
  { id: "problem",     label: "The Problem" },
  { id: "research",    label: "Our Research" },
  { id: "results",     label: "What We Found" },
  { id: "implication", label: "Implication" },
  { id: "action",      label: "Take Action" },
];

const SidebarTOC = ({ activeSection }) => (
  <div style={{ position: "sticky", top: "25vh", width: "100%", fontFamily: "'Inter',sans-serif" }}>
    <ul style={{ listStyle: "none", margin: 0, padding: "0 4rem 0 0", textAlign: "right" }}>
      {LINKS.map((link, i) => {
        const active = activeSection === link.id;
        return (
          <React.Fragment key={link.id}>
            <li
              style={{ padding: "0.8rem 0", color: active ? "#fff" : "rgba(255,255,255,0.4)", transition: "color 0.3s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", cursor: "pointer" }}
              onClick={() => { const el = document.getElementById(`section-${link.id}`); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" }); }}
            >
              <div style={{ marginRight: "1rem", letterSpacing: "0.05em", fontSize: "0.95rem" }}>{link.label}</div>
              <div id={`toc-node-${link.id}`} style={{ width: "10px", height: "10px", border: `1px solid ${active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.3s ease", boxShadow: active ? "0 0 10px rgba(255,255,255,0.2)" : "none" }}>
                <div style={{ width: "5px", height: "5px", backgroundColor: active ? "rgba(255,255,255,0.9)" : "transparent", transition: "background-color 0.3s ease" }} />
              </div>
            </li>
            {i < LINKS.length - 1 && <div style={{ height: "1px", background: "linear-gradient(270deg,transparent,rgba(255,255,255,0.1) 80%,transparent)", width: "100%", margin: "0.3rem 0" }} />}
          </React.Fragment>
        );
      })}
    </ul>
  </div>
);

// ─── DynamicConnector ─────────────────────────────────────────────────────────
const DynamicConnector = ({ activeSection }) => {
  const svgRef = useRef(null);
  useEffect(() => {
    let raf;
    const draw = () => {
      const svg = svgRef.current;
      if (!svg || !activeSection) return;
      const nodeEl = document.getElementById(`toc-node-${activeSection}`);
      const eyeEl  = document.getElementById(`eye-${activeSection}`);
      if (!nodeEl || !eyeEl) return;
      const nr = nodeEl.getBoundingClientRect(), er = eyeEl.getBoundingClientRect();
      const sx = nr.right + 2, sy = nr.top + nr.height / 2;
      const ex = er.left - 5,  ey = er.top + er.height / 2;
      const mx = sx + 40;
      const path = svg.querySelector("path");
      if (path) { path.setAttribute("d", `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`); path.style.opacity = 1; }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", draw);
    window.addEventListener("scroll", draw, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", draw); window.removeEventListener("scroll", draw); };
  }, [activeSection]);
  return (
    <svg ref={svgRef} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 15 }}>
      <path d="" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" style={{ opacity: 0, transition: "opacity 0.3s ease" }} />
    </svg>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [irisPos,       setIrisPos]       = useState({ x: 0, y: 0 });
  const [phase,         setPhase]         = useState("normal");
  const [scrollProgress,setScrollProgress]= useState(0);
  const [activeSection, setActiveSection] = useState("home");

  // Active section tracking
  useEffect(() => {
    if (phase !== "welcome") return;
    const onScroll = () => {
      const threshold = window.innerHeight * 0.4;
      let cur = SECTIONS[0];
      SECTIONS.forEach(sec => {
        const el = document.getElementById(`section-${sec}`);
        if (el && el.getBoundingClientRect().top <= threshold) cur = sec;
      });
      setActiveSection(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // Scroll progress for welcome animation
  useEffect(() => {
    const onScroll = () => {
      if (phase !== "welcome") return;
      setScrollProgress(Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1));
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // Eye intro
  const leftHit = useRef(false), rightHit = useRef(false), triggered = useRef(false), containerRef = useRef(null);
  const [hintText, setHintText] = useState("look left · look right");

  const triggerSequence = () => {
    if (triggered.current) return;
    triggered.current = true;
    setPhase("centering"); setIrisPos({ x: 0, y: 0 });
    setTimeout(() => setPhase("rolling"),   650);
    setTimeout(() => setPhase("expanding"), 1700);
    setTimeout(() => setPhase("welcome"),   4200);
  };

  const handleMouseMove = useCallback((e) => {
    if (phase !== "normal" || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top  + r.height / 2);
    const dist = Math.sqrt((mx / CONSTRAINT_RX) ** 2 + (my / CONSTRAINT_RY) ** 2);
    let nx = mx, ny = my;
    if (dist > 1) { const a = Math.atan2(my / CONSTRAINT_RY, mx / CONSTRAINT_RX); nx = Math.cos(a) * CONSTRAINT_RX; ny = Math.sin(a) * CONSTRAINT_RY; }
    setIrisPos({ x: nx, y: ny });
    const nX = nx / CONSTRAINT_RX;
    if (nX <= -0.94 && !leftHit.current)  { leftHit.current  = true; setHintText(rightHit.current ? "" : "now look right →"); if (rightHit.current) triggerSequence(); }
    if (nX >=  0.94 && !rightHit.current) { rightHit.current = true; setHintText(leftHit.current  ? "" : "← now look left");  if (leftHit.current)  triggerSequence(); }
  }, [phase]);

  useEffect(() => {
    if (phase !== "normal") return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [phase, handleMouseMove]);

  const irisStyle = {
    normal:    { transform: `translate(${irisPos.x}px,${irisPos.y}px)`, opacity: 1, transition: "transform 0.06s linear" },
    centering: { transform: "translate(0px,0px)", opacity: 1, transition: "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)" },
    rolling:   { transform: "translate(0px,-260px)", opacity: 1, transition: "transform 0.85s cubic-bezier(0.4,0,0.75,0.6)" },
  }[phase] ?? { transform: "translate(0px,-260px)", opacity: 1, transition: "none" };

  const eyeExpandScale = (phase === "expanding" || phase === "welcome") ? 60 : 1;
  const eyeExpandTransition = phase === "expanding" ? "transform 2.8s cubic-bezier(0.22,1,0.36,1)" : "none";
  const sp = scrollProgress;

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>
      {/* ── INTRO: sticky eye scene ── */}
      <div style={{ height: phase === "welcome" ? "250vh" : "100vh", position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: phase === "normal" ? "none" : "auto", position: "sticky", top: 0, userSelect: "none", zIndex: 1 }}>

          {phase === "normal" && (
            <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.18)", fontFamily: "'Courier New',monospace", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", pointerEvents: "none", whiteSpace: "nowrap", animation: "pulseHint 3s ease-in-out infinite" }}>
              {hintText}
            </div>
          )}

          <svg width="700" height="400" viewBox="-350 -200 700 400" style={{ overflow: "visible", position: "relative", zIndex: 1 }} aria-hidden="true">
            <defs><clipPath id="eyeClip"><path d={EYE_PATH} /></clipPath></defs>
            <path d={EYE_PATH} fill="white" />
            <g clipPath="url(#eyeClip)"><circle cx={0} cy={0} r={IRIS_R} fill="black" style={irisStyle} /></g>
          </svg>

          {(phase === "rolling" || phase === "expanding" || phase === "welcome") && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
              <svg width="700" height="400" viewBox="-350 -200 700 400" style={{ overflow: "visible", transform: `scale(${eyeExpandScale})`, transition: eyeExpandTransition, transformOrigin: "center center" }} aria-hidden="true">
                <path d={EYE_PATH} fill="white" />
              </svg>
            </div>
          )}

          {phase === "welcome" && (
            <div style={{ position: "absolute", left: "15vw", top: "50%", transform: `translateY(-50%) translateY(${20 - sp * 20}px)`, opacity: Math.max(0, (sp - 0.2) * 1.5), zIndex: 2, width: "clamp(250px,25vw,400px)", aspectRatio: "3/4", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
              <img src="/wellness_placeholder.png" alt="Wellness" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {phase === "welcome" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
              <div style={{ fontFamily: SERIF, fontSize: "clamp(1rem,2.5vw,1.8rem)", letterSpacing: "0.35em", color: "#111", textTransform: "uppercase", fontWeight: 300, display: "flex", alignItems: "center", animation: "fadeInUp 2.2s cubic-bezier(0.22,1,0.36,1) 0.2s both", transform: `translateX(calc(${sp * -20}vw)) translate(${sp * -6}em,${sp * -3}em)`, whiteSpace: "nowrap" }}>
                <span style={{ opacity: Math.max(0, 1 - sp * 5) }}>Hello, welcome to&nbsp;</span>
                {["C","A","K","L"].map((letter, i) => (
                  <div key={letter} style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ display: "inline-block", transform: `translate(${sp * -i * 1.5}em,${sp * i * 2}em)`, fontWeight: sp > 0.5 ? "bold" : 300, position: "relative", width: "1.2em", textAlign: "center" }}>
                      {letter}
                      <span style={{ position: "absolute", left: "100%", top: 0, opacity: Math.max(0, (sp - 0.5) * 5), fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                        {["are","wareness","indness","aughter"][i]}
                      </span>
                    </span>
                    {i < 3 && <span style={{ opacity: Math.max(0, 1 - sp * 5), display: "inline-block", width: "0.3em" }}>.</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECOND PAGE ── */}
      {phase === "welcome" && (
        <div style={{ position: "relative", zIndex: 10, background: "#050505", minHeight: "100vh", paddingBottom: "10vh" }}>

          {/* Top bar */}
          <div style={{ position: "sticky", top: 0, zIndex: 20, padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(5,5,5,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: "1.5rem", letterSpacing: "0.25em", color: "white", display: "flex", alignItems: "center", cursor: "default" }}>
              C. <MiniEye /> .K.L.
            </div>
          </div>

          <DynamicConnector activeSection={activeSection} />

          {/* Layout */}
          <div style={{ display: "flex", width: "100%", maxWidth: "1400px", margin: "0 auto", paddingTop: "15vh", gap: "5vw" }}>

            {/* Sidebar */}
            <div style={{ width: "25%", minWidth: "200px", position: "relative", zIndex: 20 }}>
              <SidebarTOC activeSection={activeSection} />
            </div>

            {/* Main content */}
            <div style={{ flex: 1, paddingLeft: "2rem", paddingRight: "2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 10 }}>

              {/* HOME */}
              <div id="section-home" style={{ position: "relative", top: "-25vh" }} />
              <FadeIn delay={100}>
                <div id="eye-home" style={{ marginBottom: "1.5rem" }}><StaticEye /></div>
                <div style={{ fontSize: "0.85rem", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", fontFamily: "Inter,Roboto,sans-serif" }}>HOME</div>
              </FadeIn>
              <FadeIn delay={300}>
                <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 300, letterSpacing: "0.05em", color: "white", marginBottom: "3.5rem", lineHeight: 1.2 }}>
                  Laughter as a Way to Cope
                </h1>
              </FadeIn>
              <Para delay={600}>Stress is part of everyday life, especially for univeristy students and young adults.<br />But what if something as simple and innocuous as humour could help you manage it?</Para>
              <Para delay={800} color="rgba(255,255,255,0.85)" mb="4rem">At C.A.K.L., we raise awareness about mental health and promote healthy coping strategies through <span style={{ color: "white", fontWeight: 600 }}>care, awareness, kindness, and laughter.</span></Para>
              <FadeIn delay={1000}>
                <div style={{ border: "1px solid rgba(255,255,255,0.15)", padding: "2.5rem 3rem", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.02)", maxWidth: "700px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                  <p style={{ fontFamily: SERIF, fontSize: "1.4rem", color: "white", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>"Our research shows that humour is more than simply a form of entertainment. It helps people reassess stressful situations and cope more effectively."</p>
                </div>
              </FadeIn>
              <Sep mt="8rem" />

              {/* THE PROBLEM */}
              <SectionHead id="problem">Why Mental Health and Coping Matter</SectionHead>
              <Para delay={200}>Many young adults experience stress across a number of avenues, be it academics, social pressure, or personal challenges.</Para>
              <Para delay={300}>While there are many coping strategies, not all of them are healthy or effective. Some people avoid problems instead of dealing with them, which can make stress worse over time.</Para>
              <Para delay={400}>Research shows that coping strategies play a major role in emotional wellbeing. However, many people are not consciously aware of how they manage stress or whether their methods are helpful.</Para>
              <Para delay={500} color="rgba(255,255,255,0.85)">Studies have shown that <span style={{ color: "white", fontWeight: 600 }}>humour can help reduce stress</span> and improve emotional regulation by changing how people think about difficult situations.</Para>
              <Para delay={600} mb="6rem">Other research also suggests that not all forms of humour are helpful. The effectiveness depends heavily on the context and how it is used.</Para>
              <Sep />

              {/* OUR RESEARCH */}
              <SectionHead id="research">What We Studied</SectionHead>
              <Para delay={200}>To better understand how humour works as a coping strategy, we conducted a survey with university students across the UAE.</Para>
              <Para delay={300} mb="1rem">Participants were asked questions about:</Para>
              <FadeIn delay={400}>
                <ul style={{ fontFamily: SERIF, fontSize: "clamp(1.1rem,2vw,1.35rem)", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, maxWidth: "600px", textAlign: "left", margin: "0 auto 3rem auto", paddingLeft: "2rem" }}>
                  {["How often they use humour when stressed","Whether humour helps them feel better","Whether they are aware of using humour as a coping strategy"].map(t => <li key={t} style={{ marginBottom: "0.8rem", paddingLeft: "0.5rem" }}>{t}</li>)}
                </ul>
              </FadeIn>
              <Para delay={500} mb="6rem">The goal was to understand how young adults actually use humour in real life.</Para>
              <Sep />

              {/* RESULTS */}
              <SectionHead id="results">Results &amp; Insights</SectionHead>
              <KeyFinding label="KEY FINDING 1 (BIGGEST)" title="Humour helps people rethink stress" desc="Most participants said humour helps them see stressful situations differently." chart={<AnimatedBarChart data={[{ label:"Agree", value:74, color:"#4ade80" },{ label:"Disagree", value:6, color:"#f87171" }]} />} />
              <KeyFinding label="KEY FINDING 2" title="Humour is used very often" desc="Students reported using humour regularly when they feel stressed." chart={<AnimatedBarChart data={[{ label:"Agree", value:72, color:"#4ade80" },{ label:"Disagree", value:8, color:"#f87171" }]} />} />
              <KeyFinding label="KEY FINDING 3 (INTERESTING PATTERN)" title="People think humour is helpful, but sometimes use it to avoid addressing problems" desc="Some participants said they use humour instead of dealing with stress directly. This suggests humour can be helpful, but also misused depending on the situation."
                chart={
                  <div style={{ display:"flex", gap:"4rem", flexWrap:"wrap", justifyContent:"center" }}>
                    {[{ label:"Helps manage stress",          data:[{label:"Agree",value:56,color:"#4ade80"},{label:"Disagree",value:17,color:"#f87171"}] },
                      { label:"Used instead of solving problem", data:[{label:"Agree",value:43,color:"#4ade80"},{label:"Disagree",value:20,color:"#f87171"}] }]
                      .map(g => <div key={g.label} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}><div style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.8)", marginBottom:"-1rem", fontFamily:"Inter,sans-serif" }}>{g.label}</div><AnimatedBarChart data={g.data} /></div>)}
                  </div>
                }
              />
              <KeyFinding mb="8rem" label="KEY FINDING 4" title="Most people are aware they use humour" desc="Many participants said they consciously use humour to cope with stress."
                chart={<div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}><div style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.8)", marginBottom:"-1rem", fontFamily:"Inter,sans-serif" }}>Consciously use humour to cope</div><AnimatedBarChart data={[{label:"Agree",value:60,color:"#4ade80"},{label:"Disagree",value:10,color:"#f87171"}]} /></div>}
              />
              <Sep />

              {/* IMPLICATION */}
              <SectionHead id="implication">So What Does This Mean?</SectionHead>
              <Para delay={200}>Our findings show that humour is a powerful tool for managing stress, especially when changing how people think about difficult situations.</Para>
              <Para delay={300}>However, it is not always helpful. In some cases, humour may be used to avoid problems instead of addressing them.</Para>
              <Para delay={400} color="rgba(255,255,255,0.85)" mb="8rem"><strong style={{ color:"white", fontWeight:600 }}>This means that how humour is used is just as important as how often it is used.</strong></Para>
              <Sep />

              {/* TAKE ACTION */}
              <SectionHead id="action" mb="4rem">What Can We Do?</SectionHead>
              <FadeIn delay={200}>
                <div style={{ marginBottom:"4rem", width:"100%", textAlign:"left", maxWidth:"700px" }}>
                  <h3 style={{ color:"white", fontSize:"1.4rem", fontFamily:SERIF, fontWeight:400, marginBottom:"1.5rem" }}>Universities should include coping strategy workshops</h3>
                  <p style={{ color:"rgba(255,255,255,0.75)", lineHeight:1.8, marginBottom:"1rem", fontFamily:SERIF, fontSize:"1.2rem" }}>These workshops can teach students how to:</p>
                  <ul style={{ color:"rgba(255,255,255,0.75)", lineHeight:1.8, fontFamily:SERIF, fontSize:"1.2rem", paddingLeft:"1.5rem" }}>
                    {["Use humour in a healthy way","Recognize when it becomes avoidance","Develop better stress management habits"].map(t => <li key={t} style={{ marginBottom:"0.5rem" }}>{t}</li>)}
                  </ul>
                </div>
              </FadeIn>
              <FadeIn delay={300}>
                <div style={{ marginBottom:"4rem", width:"100%", textAlign:"left", maxWidth:"700px" }}>
                  <h3 style={{ color:"white", fontSize:"1.4rem", fontFamily:SERIF, fontWeight:400, marginBottom:"1.5rem" }}>Students should reflect on how they cope with stress</h3>
                  <p style={{ color:"rgba(255,255,255,0.75)", lineHeight:1.8, marginBottom:"1rem", fontFamily:SERIF, fontSize:"1.2rem" }}>Ask yourself:</p>
                  <ul style={{ color:"rgba(255,255,255,0.75)", lineHeight:1.8, fontFamily:SERIF, fontSize:"1.2rem", paddingLeft:"1.5rem", listStyleType:"' '" }}>
                    {["Am I using humour to deal with stress, or to avoid it?","Is it actually helping me feel better?"].map(t => <li key={t} style={{ marginBottom:"0.5rem", paddingLeft:"0.5rem" }}>{t}</li>)}
                  </ul>
                </div>
              </FadeIn>
              <FadeIn delay={400}>
                <div style={{ marginTop:"2rem", padding:"3.5rem 3rem", background:"linear-gradient(135deg,rgba(74,222,128,0.08),rgba(0,0,0,0) 80%)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:"8px", maxWidth:"700px", width:"100%", boxShadow:"0 20px 40px rgba(0,0,0,0.5)", display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"8rem" }}>
                  <p style={{ fontFamily:SERIF, fontSize:"clamp(1.4rem,2.5vw,1.8rem)", color:"white", lineHeight:1.5, margin:0, textAlign:"center", letterSpacing:"0.05em" }}>Start using humour mindfully,<br />not just spontaneously.</p>
                </div>
              </FadeIn>

            </div>
          </div>
        </div>
      )}

      <style>{`
        body { margin:0; padding:0; overflow-x:hidden; background:#000; -ms-overflow-style:none; scrollbar-width:none; }
        body::-webkit-scrollbar { display:none; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); letter-spacing:0.55em; } to { opacity:1; transform:translateY(0); letter-spacing:0.35em; } }
        @keyframes pulseHint { 0%,100% { opacity:0.18; } 50% { opacity:0.38; } }
      `}</style>
    </div>
  );
}