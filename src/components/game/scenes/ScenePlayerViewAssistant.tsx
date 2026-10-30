"use client";

import { AnimatePresence, motion } from "framer-motion";
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
    aiLine, ambientAside, reactionActive, canSkipReaction, onSkipReaction,
    glance, pokeFlinch, choiceFlush, pokeable, onOrbPoke,
  } = p;

  const safeGap = pokeFlinch ? 36 : spotlight ? 32 : 28;
  const bubbleReads = !systemLock || !!aiLine;
  const skippable = !!(reactionActive && canSkipReaction && onSkipReaction);

  return (
    <>
      <motion.div
        className={`absolute ${assistantZ} flex pointer-events-none ${assistantLayout}`}
        style={{
          left: orbStyle.right ? "auto" : (orbStyle.left ?? "2.5%"),
          right: orbStyle.right ?? "auto",
          top: orbStyle.top,
          transform: "none",
          gap: safeGap,
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
            ? { x: [-2, 2, -1, 0] }
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

        <div
          className="flex shrink flex-col gap-2"
          style={{
            maxWidth: bubbleMax,
            marginTop: dockBeside || spotlight ? 4 : 0,
            marginBottom: dockAbove && !spotlight ? 24 : 0,
          }}
        >
          <motion.div
            className={`glass-panel assistant-bubble relative shrink border border-cyan/45 px-2.5 py-1.5 text-sm leading-relaxed text-[#f0f7ff] shadow-[0_0_24px_rgba(110,231,255,0.14)] ${
              skippable ? "pointer-events-auto cursor-pointer hover:border-cyan/80" : "pointer-events-none"
            }`}
            style={{
              maxWidth: bubbleMax,
              maxHeight: spotlight
                ? "min(48vh, 320px)"
                : dockBeside
                  ? "min(32vh, 200px)"
                  : dockAbove
                    ? "min(40vh, 260px)"
                    : dockLeft
                      ? "min(40vh, 260px)"
                      : "min(34vh, 220px)",
              overflow: "visible",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
            key={`${p.scene.id}:${aiLine || "silent"}`}
            data-assistant-bubble="true"
            data-bubble-scene={p.scene.id}
            data-bubble-dock={
              dockLeft ? "left" : dockBeside || spotlight ? "beside" : dockAbove ? "above" : "below"
            }
            data-bubble-tail="true"
            data-bubble-no-clip="true"
            onClick={skippable ? onSkipReaction : undefined}
            initial={{
              opacity: 0,
              x: dockLeft ? 8 : dockBeside || spotlight ? -8 : 0,
              y: dockLeft || dockBeside || spotlight ? 0 : dockAbove ? -8 : 8,
              scale: 0.96,
            }}
            animate={{
              opacity: buryAssistant && !systemLock ? 0.85 : 1,
              x: 0,
              y: 0,
              scale: 1,
            }}
            transition={{ delay: 0, duration: 0.28, ease: "easeOut" }}
          >
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
            {skippable ? (
              <div
                className="mt-1.5 flex items-center justify-end font-mono text-[9px] tracking-[0.2em] text-cyan/85 uppercase transition-colors hover:text-white"
                data-reaction-continue="true"
              >
                CLICK TO CONTINUE →
              </div>
            ) : null}
          </motion.div>

          {/* Dedicated secondary channel for background easter-egg remarks (Finding #4) */}
          <AnimatePresence>
            {ambientAside ? (
              <motion.div
                key={ambientAside}
                role="status"
                aria-live="polite"
                data-ambient-aside-bubble="true"
                className="pointer-events-none border border-cyan/35 bg-[#06101c]/90 px-2.5 py-1.5 text-left shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-0.5 font-mono text-[8px] tracking-[0.22em] text-cyan/75 uppercase">
                  ASIDE // INTERJECTION
                </div>
                <div className="break-words text-[12px] leading-snug text-[#d4e8f8]">
                  {ambientAside}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
