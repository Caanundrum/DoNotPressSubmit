"use client";

import { jsx as i, jsxs as a } from "react/jsx-runtime";
import { AnimatePresence as ve, motion as c } from "framer-motion";
import { useCallback as ne, useEffect as E, useMemo as he, useRef as V, useState as d } from "react";
import { resolveClimaxEnding as ke } from "@/game/endings";
import { choiceEnter as we, defaultAnchorForMood as Ne, orbStageStyle as Se, panelLayoutClass as Ce, panelVariants as Ie } from "@/game/motion";
import { getScene as ie } from "@/game/scenes";
import { applyEffects as oe, pathResidueKind as Te, resolveAiLine as Ae } from "@/game/state";
import { rememberTitleAlly as Le, rememberTitleWave as Ee } from "@/game/storage";
import { audio as x } from "@/lib/audio";
import { speech as M } from "@/lib/speech";
import { AmbientChrome as Me, AmbientRoamers as Oe } from "../AmbientInteractives";
import { AssistantOrb as Ge } from "../AssistantOrb";
import { BackgroundGags as Pe } from "../BackgroundGags";
import { FacilityBackground as X } from "../FacilityBackground";
import { PathResidue as Re } from "../PathResidue";
import { AssessmentReport as Fe } from "./AssessmentReport";
import { AuthorityStamp as De } from "./AuthorityStamp";
import { CheckboxRebellion as ze } from "./CheckboxRebellion";
import { EndingSequence as He } from "./EndingSequence";
import { EscapingButton as $e } from "./EscapingButton";
import { PeelReveal as Ue } from "./PeelReveal";
import { PopupWar as We } from "./PopupWar";
import { RestlessOptions as Ye } from "./RestlessOptions";
import { SubmitClimax as je } from "./SubmitClimax";
import { p0 } from "./_sp_p0";
import { p1 } from "./_sp_p1";

const moduleExports: { ScenePlayer?: (props: any) => any } = {};
new Function(
  "exports", "i", "a", "ve", "c", "ne", "E", "he", "V", "d", "ke", "we", "Ne", "Se", "Ce", "Ie", "ie", "oe", "Te", "Ae", "Le", "Ee", "x", "M", "Me", "Oe", "Ge", "Pe", "X", "Re", "Fe", "De", "ze", "He", "$e", "Ue", "We", "Ye", "je",
  p0 + p1
)(moduleExports, i, a, ve, c, ne, E, he, V, d, ke, we, Ne, Se, Ce, Ie, ie, oe, Te, Ae, Le, Ee, x, M, Me, Oe, Ge, Pe, X, Re, Fe, De, ze, He, $e, Ue, We, Ye, je);

export const ScenePlayer = moduleExports.ScenePlayer!;
