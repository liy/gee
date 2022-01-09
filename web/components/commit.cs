.commit {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;

  white-space: nowrap;

  display: flex;
  flex-direction: column;
  justify-content: center;

  cursor: default;
}

.commit .top {
  display: flex;
  justify-content: space-between;
}

.commit .bottom {
  line-height: 13px;
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  color: #777;
  font-size: 11px;

  margin-top: 2px;
  display: flex;
  justify-content: flex-start;
}

.commit .bottom *:last-child {
  margin-left: auto;
}

.commit .summary {
  min-width: 100px;
  /* hardcode max width for 50 character summary */
  max-width: 290px;

  overflow: hidden;
  text-overflow: ellipsis;
}

.commit .author {
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;

  color: #777;
  font-size: 11px;
}

.commit .date {
  font-size: 11px;

  color: #777;
  font-size: 11px;
}

.commit .refs {
  display: flex;
  column-gap: 4px;
  margin-left: 4px;
}

.commit .refs * {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}
