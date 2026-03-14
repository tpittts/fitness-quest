import { useState, useEffect } from "react";

const ACTIVITIES = {
  strengthTraining: { name: "Strength Training", emoji: "🧘🏾", xp: 50, color: "#C8A882" },
  danceCardio:      { name: "Dance Cardio",       emoji: "💃🏾", xp: 40, color: "#7BAE7F" },
  walk:             { name: "Daily Walk",          emoji: "🚶🏾", xp: 20, color: "#89B4CC" },
  tennis:           { name: "Tennis",              emoji: "🎾",   xp: 60, color: "#E8C547" },
  liveClass:        { name: "Live Class",          emoji: "🏃🏾", xp: 45, color: "#C8A882" },
};

const LEVELS = [
  { level: 1, name: "Fresh Start",        min: 0    },
  { level: 2, name: "Getting Moving",     min: 200  },
  { level: 3, name: "Building Momentum",  min: 500  },
  { level: 4, name: "Strong Mama",        min: 900  },
  { level: 5, name: "5K Ready",           min: 1400 },
  { level: 6, name: "Comeback Complete",  min: 1800 },
];

const REWARDS = [
  { xp: 60,   name: "New Lip Color",                    emoji: "💄" },
  { xp: 150,  name: "New Workout Fit",                  emoji: "👟" },
  { xp: 250,  name: "New Earrings",                     emoji: "💎" },
  { xp: 350,  name: "Fancy Water Tumbler",              emoji: "💧" },
  { xp: 450,  name: "Nespresso Pods or Energy Drinks",  emoji: "⚡" },
  { xp: 600,  name: "New Tennis Racket",                emoji: "🎾" },
  { xp: 1000, name: "Massage or Spa Day",               emoji: "💆" },
  { xp: 1100, name: "Gym Trial Membership",             emoji: "🏋️" },
  { xp: 1400, name: "5K Race Entry",                    emoji: "🏅" },
  { xp: 1800, name: "New Sneakers",                     emoji: "👠" },
];

const WEEKS = 10;
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STORAGE_KEY = "fitnessquest_v1";

const makeWeekPlan = () =>
  Array.from({ length: WEEKS }, (_, w) => ({
    week: w + 1,
    days: Array.from({ length: 7 }, (_, d) => ({
      day: d, activities: [], completed: false, xpEarned: 0,
    })),
  }));

const safeLoad = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
};

const safeSave = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const getCurrentLevel = (xp) =>
  [...LEVELS].reverse().find((l) => xp >= l.min) || LEVELS[0];

export default function FitnessQuest() {
  const [totalXP, setTotalXP] = useState(() => safeLoad(STORAGE_KEY + "_xp", 0));
  const [weekPlan, setWeekPlan] = useState(() => safeLoad(STORAGE_KEY + "_plan", makeWeekPlan()));
  const [currentWeek, setCurrentWeek] = useState(0);
  const [toast, setToast] = useState(null);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [logging, setLogging] = useState(null);

  useEffect(() => { safeSave(STORAGE_KEY + "_xp", totalXP); }, [totalXP]);
  useEffect(() => { safeSave(STORAGE_KEY + "_plan", weekPlan); }, [weekPlan]);

  const currentLevel = getCurrentLevel(totalXP);
  const nextLevel = LEVELS.find((l) => l.min > currentLevel.min) || null;
  const progress = nextLevel
    ? Math.min(100, ((totalXP - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;

  const showToast = (msg, emoji) => {
    setToast({ msg, emoji });
    setTimeout(() => setToast(null), 2500);
  };

  const toggleActivity = (week, day, actKey) => {
    setWeekPlan((prev) =>
      prev.map((w, wi) => wi !== week ? w : {
        ...w,
        days: w.days.map((d, di) => di !== day ? d : {
          ...d,
          activities: d.activities.includes(actKey)
            ? d.activities.filter((a) => a !== actKey)
            : [...d.activities, actKey],
        }),
      })
    );
  };

  const completeDay = (week, day) => {
    const d = weekPlan[week].days[day];
    if (d.completed || d.activities.length === 0) return;
    const earned = d.activities.reduce((sum, k) => sum + (ACTIVITIES[k]?.xp || 0), 0);
    setWeekPlan((prev) =>
      prev.map((w, wi) => wi !== week ? w : {
        ...w,
        days: w.days.map((dd, di) => di !== day ? dd : { ...dd, completed: true, xpEarned: earned }),
      })
    );
    setTotalXP((x) => x + earned);
    setLogging(null);
    showToast(`+${earned} XP earned!`, "⚡");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0e17", fontFamily: "'Georgia', serif", color: "#f5f0e8", paddingBottom: 80 }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 20%, #1a1030 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #0d1f15 0%, transparent 60%)" }} />

      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: "#C8A882", color: "#0f0e17", padding: "10px 20px", borderRadius: 40, fontWeight: "bold", fontSize: 16, zIndex: 100, boxShadow: "0 4px 30px rgba(200,168,130,0.4)", letterSpacing: 1, whiteSpace: "nowrap" }}>
          {toast.emoji} {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px", position: "relative" }}>

        {/* Header */}
        <div style={{ textAlign: "center", paddingTop: 36, paddingBottom: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: 4, color: "#C8A882", marginBottom: 6, textTransform: "uppercase" }}>Rae's</div>
          <h1 style={{ fontSize: 34, margin: 0, fontWeight: "normal", letterSpacing: 2, lineHeight: 1.1 }}>Fitness Quest</h1>
          <div style={{ fontSize: 11, color: "#888", marginTop: 6, letterSpacing: 2 }}>10 WEEKS · POSTPARTUM COMEBACK</div>
        </div>

        {/* XP Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,168,130,0.2)", borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>Level {currentLevel.level}</div>
              <div style={{ fontSize: 20, color: "#C8A882" }}>{currentLevel.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#f5f0e8", lineHeight: 1 }}>{totalXP}</div>
              <div style={{ fontSize: 11, color: "#888", letterSpacing: 2 }}>TOTAL XP</div>
            </div>
          </div>
          {nextLevel && (
            <>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #C8A882, #7BAE7F)", borderRadius: 10, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: "#666", textAlign: "right" }}>{nextLevel.min - totalXP} XP to "{nextLevel.name}"</div>
            </>
          )}
        </div>

        {/* Goal Banner */}
        <div style={{ background: "linear-gradient(135deg, rgba(123,174,127,0.15), rgba(123,174,127,0.05))", border: "1px solid rgba(123,174,127,0.3)", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28 }}>🏅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#7BAE7F", textTransform: "uppercase" }}>Final Goal</div>
            <div style={{ fontSize: 15 }}>Run a 5K before returning to work</div>
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>Wk 10 🎯</div>
        </div>

        {/* Week Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
          {weekPlan.map((w, i) => {
            const weekXP = w.days.reduce((sum, d) => sum + d.xpEarned, 0);
            return (
              <button key={i} onClick={() => setCurrentWeek(i)} style={{
                flex: "0 0 auto", padding: "8px 12px", borderRadius: 10,
                border: currentWeek === i ? "1px solid #C8A882" : "1px solid rgba(255,255,255,0.08)",
                background: currentWeek === i ? "rgba(200,168,130,0.15)" : "rgba(255,255,255,0.03)",
                color: currentWeek === i ? "#C8A882" : "#888",
                cursor: "pointer", fontSize: 12, letterSpacing: 1, transition: "all 0.2s", minHeight: 44,
              }}>
                <div>Wk {i + 1}</div>
                {weekXP > 0 && <div style={{ fontSize: 10, color: "#7BAE7F" }}>+{weekXP}</div>}
              </button>
            );
          })}
        </div>

        {currentWeek === 0 && (
          <div style={{ fontSize: 11, color: "#666", marginBottom: 14, fontStyle: "italic" }}>
            ✦ Get OB cleared Monday · Start gentle · Walk daily
          </div>
        )}

        {/* Days */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {weekPlan[currentWeek].days.map((d, di) => {
            const isLogging = logging?.week === currentWeek && logging?.day === di;
            const isWeekend = di >= 5;
            const pendingXP = d.activities.reduce((s, k) => s + (ACTIVITIES[k]?.xp || 0), 0);
            return (
              <div key={di} style={{
                background: d.completed ? "rgba(123,174,127,0.1)" : "rgba(255,255,255,0.03)",
                border: d.completed ? "1px solid rgba(123,174,127,0.3)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "12px 16px", transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: "bold", letterSpacing: 2, color: d.completed ? "#7BAE7F" : isWeekend ? "#666" : "#f5f0e8", textTransform: "uppercase", minWidth: 36 }}>
                      {DAY_NAMES[di]}
                    </div>
                    {isWeekend && !d.completed && <span style={{ fontSize: 11, color: "#555", fontStyle: "italic" }}>rest or bonus</span>}
                    {d.completed && <span style={{ fontSize: 11, color: "#7BAE7F" }}>✓ +{d.xpEarned} XP</span>}
                    {d.activities.length > 0 && !d.completed && (
                      <div style={{ display: "flex", gap: 4 }}>
                        {d.activities.map((k) => <span key={k} style={{ fontSize: 16 }}>{ACTIVITIES[k]?.emoji}</span>)}
                      </div>
                    )}
                  </div>
                  {!d.completed && (
                    <button onClick={() => setLogging(isLogging ? null : { week: currentWeek, day: di })} style={{
                      padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(200,168,130,0.3)",
                      background: isLogging ? "rgba(200,168,130,0.2)" : "transparent",
                      color: "#C8A882", cursor: "pointer", fontSize: 13, letterSpacing: 1, minHeight: 44,
                    }}>
                      {isLogging ? "cancel" : "log"}
                    </button>
                  )}
                </div>

                {isLogging && (
                  <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>What did you do?</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {Object.entries(ACTIVITIES).map(([k, act]) => {
                        const selected = d.activities.includes(k);
                        return (
                          <button key={k} onClick={() => toggleActivity(currentWeek, di, k)} style={{
                            padding: "10px 14px", borderRadius: 20,
                            border: `1px solid ${selected ? act.color : "rgba(255,255,255,0.1)"}`,
                            background: selected ? `${act.color}22` : "transparent",
                            color: selected ? act.color : "#888",
                            cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", minHeight: 44,
                          }}>
                            {act.emoji} {act.name} <span style={{ fontSize: 11, opacity: 0.7 }}>+{act.xp}</span>
                          </button>
                        );
                      })}
                    </div>
                    {d.activities.length > 0 && (
                      <button onClick={() => completeDay(currentWeek, di)} style={{
                        width: "100%", padding: "14px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #C8A882, #a8845e)",
                        color: "#0f0e17", cursor: "pointer", fontSize: 15, fontWeight: "bold", letterSpacing: 1, minHeight: 44,
                      }}>
                        Complete Day · +{pendingXP} XP
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rewards */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setRewardsOpen(!rewardsOpen)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "none", border: "none", cursor: "pointer", padding: "0 0 14px 0", minHeight: 44,
          }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#888", textTransform: "uppercase" }}>Rewards</div>
            <div style={{ fontSize: 16, color: "#888", transition: "transform 0.2s", transform: rewardsOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</div>
          </button>
          {rewardsOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REWARDS.map((r) => {
                const unlocked = totalXP >= r.xp;
                return (
                  <div key={r.xp} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12,
                    background: unlocked ? "rgba(200,168,130,0.1)" : "rgba(255,255,255,0.02)",
                    border: unlocked ? "1px solid rgba(200,168,130,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    opacity: unlocked ? 1 : 0.5, transition: "all 0.3s",
                  }}>
                    <div style={{ fontSize: 22 }}>{unlocked ? r.emoji : "🔒"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: unlocked ? "#f5f0e8" : "#666" }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>{r.xp} XP</div>
                    </div>
                    {unlocked && <div style={{ fontSize: 11, color: "#C8A882", letterSpacing: 1 }}>UNLOCKED ✦</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* XP Guide */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 10 }}>XP Guide</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(ACTIVITIES).map(([k, act]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#777" }}>
                <span>{act.emoji}</span><span>{act.name}</span><span style={{ color: act.color }}>+{act.xp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
