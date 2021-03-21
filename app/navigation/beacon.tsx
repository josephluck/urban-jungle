const makeEmitter = <T extends any>() => {
  type Subscriber = (data: T) => void;
  let subs: Subscriber[] = [];
  return {
    emit: (data: T) => subs.forEach((fn) => fn(data)),
    subscribe: (fn: Subscriber) => {
      subs.push(fn);
      return () => subs.filter((fn) => fn !== fn);
    },
  };
};

export const navigationIsAtRootBeacon = makeEmitter<boolean>();

export const navigationDidNavigateBeacon = makeEmitter<void>();
