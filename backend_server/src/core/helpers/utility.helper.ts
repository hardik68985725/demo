const escapeRegexp = (regexpString: string) =>
  regexpString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRandomColor = () => `#${Math.random().toString(16).slice(-6)}`;

const getRandomPassword = (lengthPerType = 2, symbolSet = "_!@#$"): string => {
  const capitalAlphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const smallAlphabets = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  const randomInteger = (min: number, max: number) => {
    if (!min) {
      min = 0;
    }
    if (!max) {
      max = 1;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const fisherYatesShuffle = <T>(array: T[]): T[] => {
    const arr = array.slice(); // Avoid mutating original
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomInteger(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const getRandomChars = (source: string, count: number): string[] => {
    const chars: string[] = [];
    for (let i = 0; i < count; i++) {
      chars.push(source[randomInteger(0, source.length - 1)]);
    }
    return chars;
  };

  const combinedChars = [
    ...getRandomChars(capitalAlphabets, lengthPerType),
    ...getRandomChars(smallAlphabets, lengthPerType),
    ...getRandomChars(numbers, lengthPerType),
    ...getRandomChars(symbolSet, lengthPerType)
  ];

  return fisherYatesShuffle(combinedChars).join("");
};

export { escapeRegexp, getRandomPassword, getRandomColor };
