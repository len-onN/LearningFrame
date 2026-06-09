import { watch, type WatchSource, type WatchStopHandle } from 'vue'

type MaybePromise<T> = T | Promise<T>

export function useDebouncedWatch<T>(
  source: WatchSource<T>,
  callback: (value: T, oldValue: T) => MaybePromise<void>,
  delayMs: number
): WatchStopHandle {
  return watch(source, (value, oldValue, onCleanup) => {
    const timer = setTimeout(() => {
      void callback(value, oldValue)
    }, delayMs)

    onCleanup(() => {
      clearTimeout(timer)
    })
  })
}
