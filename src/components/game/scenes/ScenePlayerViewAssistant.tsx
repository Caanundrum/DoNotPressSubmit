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

  // Spotlight / Counterpoint: bubble BESIDE the orb (never above a 168px body that
  // can enlarge/pulse into the dialogue). Keep ≥28px gap through flinch/recoil.
  const safeGap = pokeFlinch ? 36 : spotlight ? 32 : 28;
  const bubbleReads = !systemLock || !!aiLine;

  return (
    <>
      {/*
        Assistant orb + dialogue — reserved safe zone on non-gag forms.
        Layout rules: safe-zone dock, form owns center, bubble yields.
        Default: pointer-events none so form CTAs stay mouse-hittable.
        Pokeable scenes enable a tiny hit target on the orb only.
        buryAssistant gag scenes keep the orb under/behind the form on purpose
        EXCEPT system beats — those keep the bubble readable above the overlay.
      */}
      <motion.div
        className={`absolute ${assistantZ} flex pointer-events-none ${assistantLayout}`}
        style={{
          left: orbStyle.right ? "auto" : (orbStyle.left ?? "2.5%"),
          right: orbStyle.right ?? "auto",
          top: orbStyle.top,
          // FM animate x/y owns transform — do not rely on translate(-50%) for edge safety.
          transform: "none",
          gap: safeGap,
          // Right-dock / beside / spotlight-beside: width follows content so the bubble stays inside the frame.
          width: dockLeft || dockBeside || spotlight
            ? "auto"
            : Math.max(orbStyle.size, spotlight ? 280 : 168),
          maxWidth: dockLeft
            ? "min(42vw, 360px)"
            : dockBeside
              ? "min(40vw, 320px)"
              : spotlight
                ? "min(46vw, 380px)"
                : dockAbove
                  ? "min(50vw, 360px)"
                  : "min(34vw, 260px)",
          // Keep orb+rings+label+bubble inside the stage with a few px margin.
          padding: 6,
          boxSizing: "content-box",
        }}
        data-assistant-dock={
          dockLeft ? "left" : dockBeside || spotlight ? "beside" : dockAbove ? "above" : "below"
        }
        data-assistant-yield={buryAssistant && !systemLock ? "gag" : "safe-zone"}
        data-assistant-safe-dock="true"
        data-assistant-above-form={buryAssistant && !systemLock ? "false" : "true"}
        data-bubble-safe-gap={pokeFlinch ? "flinch" : spotlight ? "spotlight" : "idle"}
        animate={
          orbAnchor === "pace"
            ? // Tiny floor sway — never wander under the form answer box.
              { x: [-2, 2, -1, 0] }
            : orbAnchor === "flee" || orbAnchor === "avoid-submit"
              ? { x: [0, 1, -1, 1, 0], y: [0, -1, 1, 0] }
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
            className="pointer-events-none absolute -z-10 rounded-full"
            style={{
              // Bound the glow to the orb hit box only — never wash over bubble/label.
              width: orbStyle.size * 1.35,
              height: orbStyle.size * 1.35,
              left: 0,
              top: 0,
              background:
                "radial-gradient(circle, rgba(110,231,255,0.2) 0%, rgba(110,231,255,0.05) 45%, transparent 70%)",
            }}
            animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          />
        ) : null}
        {/* Explicit poke hit layer — companion Hold + mid/late beats must never silently no-op. */}
        <div
          className={pokeable ? "pointer-events-auto relative z-[1] shrink-0" : "pointer-events-none relative shrink-0"}
          style={{ width: orbStyle.size }}
          data-orb-hit-layer="true"
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
          className="pointer-events-none glass-panel assistant-bubble relative shrink border border-cyan/45 px-2.5 py-1.5 text-sm leading-relaxed text-[#f0f7ff] shadow-[0_0_24px_rgba(110,231,255,0.14)]"
          style={{
            maxWidth: bubbleMax,
            // Tall enough for Form 03 / Counterpoint / Form 09 full lines — no mid-word cut.
            maxHeight: spotlight
              ? "min(48vh, 320px)"
              : dockBeside
                ? "min(32vh, 200px)"
                : dockAbove
                  ? "min(40vh, 260px)"
                  : dockLeft
                    ? "min(40vh, 260px)"
                    : "min(34vh, 220px)",
            // Wrap only — never clip the last line into the orb.
            overflow: "visible",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            marginTop: dockBeside || spotlight ? 4 : 0,
            // Dock-above: keep last bubble line clear of the orb during idle pulse + flinch.
            marginBottom: dockAbove && !spotlight ? 24 : 0,
          }}
          key={`${p.scene.id}:${aiLine || "silent"}`}
          data-assistant-bubble="true"
          data-bubble-scene={p.scene.id}
          data-bubble-dock={
            dockLeft ? "left" : dockBeside || spotlight ? "beside" : dockAbove ? "above" : "below"
          }
          data-bubble-tail="true"
          data-bubble-no-clip="true"
          initial={{
            opacity: 0,
            x: dockLeft ? 8 : dockBeside || spotlight ? -8 : 0,
            y: dockLeft || dockBeside || spotlight ? 0 : dockAbove ? -8 : 8,
            scale: 0.96,
          }}
          animate={{
            // System directive must NOT faint the bubble — keep it fully readable (P0).
            opacity: buryAssistant && !systemLock ? 0.85 : 1,
            x: 0,
            y: 0,
            scale: 1,
          }}
          transition={{ delay: 0, duration: 0.28, ease: "easeOut" }}
        >
          {/* Wordless speaker mark — mood is orb look + line, not a status strip. */}
          <div
            className="mb-1 flex select-none items-center gap-1.5"
            aria-hidden
            data-bubble-speaker-mark="true"
          >
            <span className="h-1 w-1 rounded-full bg-cyan/75" />
            <span className="h-px w-4 bg-cyan/40" />
          </div>
          <div
            className="break-words text-[13px] font-medium leading-relaxed text-[#f0f7ff] sm:text-[15px]"
            style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {bubbleReads ? aiLine || "…" : "…"}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
