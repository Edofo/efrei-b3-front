import { useEffect, useState } from "react";

type useDebounceParams = {
  value: unknown;
  delay?: number;
};

export const useDebounce = ({ value, delay = 300 }: useDebounceParams) => {
  const [debouncedValue, setDebouncedValue] = useState<unknown>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
