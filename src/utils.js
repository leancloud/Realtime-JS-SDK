import { Promise } from 'rsvp';
import { default as d } from 'debug';

export const tryAll = promiseConstructors => {
  const promise = new Promise(promiseConstructors[0]);
  if (promiseConstructors.length === 1) {
    return promise;
  }
  return promise.catch(() => tryAll(promiseConstructors.slice(1)));
};

export const tap = interceptor => value => (interceptor(value), value);

const debug = d('LC:Cache');
export class Cache {
  constructor(name = 'anonymous') {
    this.name = name;
    this._map = {};
  }

  get(key) {
    const cache = this._map[key];
    if (cache) {
      const expired = cache.expiredAt && cache.expiredAt < Date.now();
      if (!expired) {
        debug(`[${this.name}] hit: ${key} ${cache.value}`);
        return cache.value;
      }
      debug(`[${this.name}] expired: ${key}`);
    }
    debug(`[${this.name}] missed: ${key}`);
    return null;
  }

  set(key, value, ttl) {
    debug(`[${this.name}] set: ${key} ${value} ${ttl}`);
    const cache = this._map[key] = {
      value,
    };
    if (typeof ttl === 'number') {
      cache.expiredAt = Date.now() + ttl;
    }
  }
}