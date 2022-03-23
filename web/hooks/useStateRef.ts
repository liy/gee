import { useEffect, useRef, useState } from 'react';

export function useStateRef<T>(
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] {
  const [value, setValue] = useState(initialValue);
  const ref = useRef(initialValue);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
}
