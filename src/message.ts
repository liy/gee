export type Message = {
  type: 'repo.open' | 'repo.response';
  data: string;
};
