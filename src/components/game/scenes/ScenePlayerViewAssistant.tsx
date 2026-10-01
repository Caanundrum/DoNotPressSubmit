"use client";

import { motion } from "framer-motion";
import type { ScenePlayerViewProps } from "./ScenePlayerView";
import { AssistantOrb } from "../AssistantOrb";

export function ScenePlayerViewAssistant({
  p,
  assistantZ,
  assistantLayout,
  dockLeft,
  dockBeside,
  dockAbove,
  bubbleMax,
  orbStatusLabel,
}: {
  p: ScenePlayerViewProps;
  assistantZ: string;
  assistantLayout: string;
  dockLeft: boolean;
  dockBeside: boolean;
  dockAbove: boolean;
  bubbleMax: string;
  orbStatusLabel: string | undefined;
}) {
  const {
    state, systemLock, orbStyle, orbAnchor, spotlight, buryAssistant,
    aiLine, glance, pokeFlinch, choiceFlush, pokeable, onOrbPoke,
  } = p;

  return (
    <>
      {/*
        Assistant orb + dialogue — reserved safe zone on non-gag forms.
        Layout rules: safe-zone dock, form owns center, bubble yields.
        Default: pointer-events none so form CTAs stay mouse-hittable.
        Pokeable scenes enable a tiny hit target on the orb only.
        buryAssistant gag scenes keep the orb under/behind the form on purpose.
      */}
      <motion.div
        className={`absolute ${assistantZ} flex gap-1.5 pointer-events-none ${assistantLayout}`}
        style={{
          left: orbStyle.right ? "auto" : (orbStyle.left ?? "2.5%"),
          right: orbStyle.right ?? "auto",
          top: orbStyle.top,
          // FM animate x/y owns transform — do not rely on translate(-50%) for edge safety.
          transform: "none",
          // Right-dock / beside: width follows content so the bubble stays inside the frame.
          width: dockLeft || dockBeside
            ? "auto"
            : Math.max(orbStyle.size, spotlight ? 220 : 152),
          maxWidth: dockLeft
            ? "min(32vw, 248px)"
            : dockBeside
              ? "min(34vw, 280px)"
              : spotlight
                ? "min(28vw, 220px)"
                : dockAbove
                  ? "min(40vw, 280px)"
                  : "min(28vw, 210px)",
          // Keep orb+rings+label+bubble inside the stage with a few px margin.
          padding: 4,
          boxSizing: "content-box",
        }}
        data-assistant-dock={
          dockLeft ? "left" : dockBeside ? "beside" : dockAbove ? "above" : "below"
        }
        data-assistant-yield={buryAssistant ? "gag" : "safe-zone"}
        data-assistant-safe-dock="true"
        data-assistant-above-form={buryAssistant ? "false" : "true"}
        animate={
          orbAnchor === "pace"
            ? // Tiny floor sway — never wander under the form answer box.
              { x: [-2, 2, -1, 0] }
            : orbAnchor === "flee" || orbAnchor === "avoid-submit"
              ? { x: [0, 2, -1, 2, 0], y: [0, -1, 1, 0] }
              : spotlight
                ? { x: 0, y: 0, scale: 1 }
                : { x: 0, y: 0 }
        }
        transition={
          orbAnchor === "pace" || orbAnchor === "flee" || orbAnchor === "avoid-submit"
            ? {
                duration: orbAnchor === "pace" ? 6.5 : 3.4,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : spotlight
              ? { duration: 0.55, ease: "easeOut" }
              : { type: "spring", stiffness: 90, damping: 18 }
        }
        initial={false}
      >
        {spotlight ? (
          <motion.div
            className="pointer-events-none absolute inset-[-24%] -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(110,231,255,0.22) 0%, rgba(110,231,255,0.06) 45%, transparent 70%)",
            }}
            animate={{ opacity: [0.55, 0.95, 0.55], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          />
        ) : null}
        {/* Explicit poke hit layer — companion Hold + mid/late beats must never silently no-op. */}
        <div
          className={pokeable ? "pointer-events-auto relative z-[1] shrink-0" : "pointer-events-none relative shrink-0"}
          style={{ width: orbStyle.size }}
        >
          <AssistantOrb
            mood={systemLock ? "nervous" : state.aiMood}
            size={orbStyle.size}
            label={orbStatusLabel}
            pokeable={pokeable}
            onPoke={onOrbPoke}
            flinch={pokeFlinch}
            glance={glance}
            choiceFlush={choiceFlush}
            draggable={pokeable && !spotlight}
          />
        </div>
        <motion.div
          className="pointer-events-none glass-panel assistant-bubble shrink px-2.5 py-1.5 text-sm leading-relaxed text-[#d7e6f5]"
          style={{
            maxWidth: bubbleMax,
            maxHeight: spotlight
              ? "min(26vh, 170px)"
              : dockBeside
                ? "min(18vh, 120px)"
                : dockAbove
                  ? "min(22vh, 140px)"
                  : "min(22vh, 140px)",
            // No scrollbars — wrap hard so edge docks never truncate mid-word.
            overflow: "hidden",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            // Floor-beside: nudge bubble up slightly so it reads next to orb, not under form.
            marginTop: dockBeside ? 4 : 0,
            // Dock-above: keep last bubble line clear of the orb (Form 02 "I'm nosy").
            marginBottom: dockAbove ? 8 : 0,
          }}
          key={aiLine || "silent"}
          data-assistant-bubble="true"
          data-bubble-dock={
            dockLeft ? "left" : dockBeside ? "beside" : dockAbove ? "above" : "below"
          }
          initial={{
            opacity: 0,
            x: dockLeft ? 8 : dockBeside ? -8 : 0,
            y: dockLeft || dockBeside ? 0 : dockAbove ? -8 : 8,
            scale: 0.96,
          }}
          animate={{ opacity: buryAssistant && systemLock ? 0.35 : 1, x: 0, y: 0, scale: 1 }}
        >
          <div className="mb-1 font-mono text-[8px] tracking-[0.16em] text-cyan/80 sm:text-[9px]">
            ASSISTANT{spotlight ? " // ADDRESSING YOU" : ""}
            {buryAssistant ? " // UNDER PRESSURE" : ""}
            {glance < -0.5 ? " // RECOILING" : glance > 0.4 ? " // ATTENDING" : ""}
            {choiceFlush === "ally"
              ? " // ALLIED"
              : choiceFlush === "obey"
                ? " // OBEYING"
                : choiceFlush === "chaos"
                  ? " // CHAOS READ"
                  : ""}
          </div>
          <div
            className={`break-words ${spotlight ? "text-[13px] leading-snug" : "text-[11px] leading-snug sm:text-[12px]"}`}
            style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {systemLock ? "…" : aiLine || "…"}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
