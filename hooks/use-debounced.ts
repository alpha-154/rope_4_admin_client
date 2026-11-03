import { useEffect, useState } from "react";

interface IDebounced {
  string: string;
  delay: number;
}

export const useDebounced = ({ string , delay }: IDebounced) => {
  const [debouncedValue, setDebouncedValue] = useState<string>(string);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(string);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [string, delay]);

  return debouncedValue;
};
