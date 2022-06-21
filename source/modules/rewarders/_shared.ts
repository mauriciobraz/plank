export type CountWithUpdatedFieldObject = {
  updatedAt: Date;
  count: number;
};

export enum Time {
  SECOND = 1000,
  MINUTE = 60 * Time.SECOND,
  HOUR = 60 * Time.MINUTE,
  DAY = 24 * Time.HOUR,
}

export interface MapWithGarbageOptions<K, V> {
  debugName?: string;
  clearGarbageInterval: number;
  shouldClearItemFn: (key: K, value: V) => boolean;
}

export class MapWithGarbageCollector<K, V> extends Map<K, V> {
  public intervalId: NodeJS.Timeout;

  constructor(options: MapWithGarbageOptions<K, V>) {
    super();

    this.intervalId = setInterval(() => {
      this.forEach((value, key) => {
        if (options.shouldClearItemFn(key, value)) {
          if (process.env.DEBUG === 'true')
            console.debug(
              `[${
                options.debugName || 'unknow'
              }.MapWithGarbageCollector] Removing ${key} from the map.`
            );

          this.delete(key);
        }
      });
    }, options.clearGarbageInterval);
  }
}
