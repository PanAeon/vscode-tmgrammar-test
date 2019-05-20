
import {AnnotatedLine} from "./model"

export function parseSnap(s:string): AnnotatedLine[] {
    return JSON.parse(s)
}

// expects xs to be already sorted by (linenumber,from)
export function renderSnap(xs: AnnotatedLine[]): string {
    return JSON.stringify(xs, undefined, 2);
}