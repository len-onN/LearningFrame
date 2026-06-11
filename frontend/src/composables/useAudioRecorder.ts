import { ref, onUnmounted } from 'vue'

export function useAudioRecorder(maxDurationSeconds = 60) {
  const isRecording = ref(false)
  const recordingTime = ref(0)
  const isSupported = ref(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia))
  const permissionDenied = ref(false)

  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let timerInterval: number | null = null
  let resolvePromise: ((file: File | null) => void) | null = null
  let stream: MediaStream | null = null

  const startTimer = () => {
    recordingTime.value = 0
    timerInterval = window.setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= maxDurationSeconds) {
        stopRecording()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }
  }

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }

  const startRecording = async (): Promise<File | null> => {
    if (!isSupported.value) return null
    
    try {
      permissionDenied.value = false
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mimeType = getSupportedMimeType()
      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      audioChunks = []

      return new Promise((resolve) => {
        resolvePromise = resolve

        mediaRecorder!.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data)
          }
        }

        mediaRecorder!.onstop = () => {
          stopTimer()
          stopStream()
          isRecording.value = false
          
          if (audioChunks.length === 0) {
            resolvePromise?.(null)
            resolvePromise = null
            return
          }

          const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
          const extension = audioBlob.type.includes('mp4') ? 'mp4' : (audioBlob.type.includes('ogg') ? 'ogg' : 'webm')
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const file = new File([audioBlob], `gravacao-${timestamp}.${extension}`, { type: audioBlob.type })
          
          resolvePromise?.(file)
          resolvePromise = null
        }

        mediaRecorder!.start(1000)
        isRecording.value = true
        startTimer()
      })

    } catch (error) {
      console.error('Failed to start recording', error)
      permissionDenied.value = true
      return null
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    } else if (resolvePromise) {
      resolvePromise(null)
    }
  }

  const cancelRecording = () => {
    audioChunks = []
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    } else if (resolvePromise) {
      resolvePromise(null)
    }
  }

  onUnmounted(() => {
    stopTimer()
    stopStream()
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    }
  })

  return {
    isRecording,
    recordingTime,
    isSupported,
    permissionDenied,
    startRecording,
    stopRecording,
    cancelRecording
  }
}
