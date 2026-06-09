import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedWatch } from './useDebouncedWatch'

describe('useDebouncedWatch', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('executa apenas a mudanca mais recente apos o atraso', async () => {
    vi.useFakeTimers()
    const source = ref('')
    const callback = vi.fn()

    const stop = useDebouncedWatch(source, callback, 300)

    source.value = 'bio'
    await nextTick()
    vi.advanceTimersByTime(299)
    expect(callback).not.toHaveBeenCalled()

    source.value = 'biologia'
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('biologia', 'bio')
    stop()
  })

  it('limpa o timeout pendente quando o watcher e parado', async () => {
    vi.useFakeTimers()
    const source = ref('')
    const callback = vi.fn()
    const scope = effectScope()

    scope.run(() => {
      useDebouncedWatch(source, callback, 300)
    })

    source.value = 'neuro'
    await nextTick()
    scope.stop()
    vi.advanceTimersByTime(300)

    expect(callback).not.toHaveBeenCalled()
  })
})
