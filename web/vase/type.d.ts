export type AddAction = {
  type: 'add';
  obj: {
    name: string;
  };
};

export type DeleteAction = {
  type: 'delete';
  id: string;
};
