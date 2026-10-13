/* Exact Nick master mark — assembled from markPart0..markPart5 */
import { markPart0 } from "./markPart0";
import { markPart1 } from "./markPart1";
import { markPart2 } from "./markPart2";
import { markPart3 } from "./markPart3";
import { markPart4 } from "./markPart4";
import { markPart5 } from "./markPart5";

const MARK_B64 = markPart0 + markPart1 + markPart2 + markPart3 + markPart4 + markPart5;

export function markPngBase64(): string {
  return MARK_B64;
}
