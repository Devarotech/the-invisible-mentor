import { curriculumV1 } from "../curriculum/model";
import { buildPrioritiesFromCurriculum } from "./curriculum-priorities";

const priorities = buildPrioritiesFromCurriculum(curriculumV1, [], "JAMB");

if (priorities.length === 0) throw new Error("Curriculum should produce learning priorities.");
if (priorities[0].score !== 0) throw new Error("Untested curriculum topics should begin at zero mastery.");
if (!priorities[0].reason) throw new Error("Every priority should explain why it was selected.");

console.log("Curriculum priority tests passed.");