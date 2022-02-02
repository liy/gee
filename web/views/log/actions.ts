export type Update = {
  type: 'update';
  logs: Log[];
  tags: Tag[];
  branches: Branch[];
  head: string;
};

// export type UpdateLog = {
//   type: 'updateLog';
//   logs: Log[];
// };

// export type UpdateTag = {
//   type: 'updateTag';
//   tags: Tag[];
// };

// export type UpdateBranch = {
//   type: 'updateBranch';
//   branches: Branch[];
// };

export type SelectLog = {
  type: 'selectLog';
  log: Log;
};

/**
 * Update simulate logs
 */
export type Simulate = {
  type: 'simulate';
  simulations: Log[];
};

export type Actions = Update | SelectLog | Simulate;
