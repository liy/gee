import { Diff } from './DiffParser';

export class PatchCreator {
  constructor(protected diff: Diff) {}

  stageLine(lineNo: number) {}

  unstageLine(lineNo: number) {}

  stageHunk(index: number) {}

  unstageHunk(index: number) {}
}
