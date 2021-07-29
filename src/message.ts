export type Message = {
  type: 'repo.open' | 'repo.open.response' | 'repo.changed';
  data: string;
};
