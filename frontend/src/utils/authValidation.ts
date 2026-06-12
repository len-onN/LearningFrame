export type AuthMode = 'login' | 'register'
export type AuthField = 'displayName' | 'email' | 'password' | 'confirmPassword'
export type AuthErrors = Partial<Record<AuthField, string>>

export interface AuthFormValues {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthErrors {
  const nextErrors: AuthErrors = {}
  const displayName = values.displayName.trim()
  const email = values.email.trim()
  const password = values.password

  if (mode === 'register') {
    if (!displayName) {
      nextErrors.displayName = 'Informe seu nome.'
    } else if (displayName.length > 120) {
      nextErrors.displayName = 'Use no maximo 120 caracteres.'
    }
  }

  if (!email) {
    nextErrors.email = 'Informe seu e-mail.'
  } else if (email.length > 180) {
    nextErrors.email = 'Use um e-mail com ate 180 caracteres.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors.email = 'Informe um e-mail valido.'
  }

  if (!password) {
    nextErrors.password = 'Informe sua senha.'
  } else if (password.length > 120) {
    nextErrors.password = 'Use no maximo 120 caracteres.'
  } else if (mode === 'register') {
    const passwordError = passwordPolicyError(password)
    if (passwordError) {
      nextErrors.password = passwordError
    }
  }

  if (mode === 'register') {
    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Confirme sua senha.'
    } else if (values.confirmPassword !== password) {
      nextErrors.confirmPassword = 'As senhas não coincidem.'
    }
  }

  return nextErrors
}

function passwordPolicyError(password: string) {
  const missing: string[] = []
  const requirements: string[] = []

  if (password.length < 8) {
    requirements.push('use pelo menos 8 caracteres')
  }
  if (!/[A-Z]/.test(password)) {
    missing.push('uma letra maiuscula')
  }
  if (!/\d/.test(password)) {
    missing.push('um numero')
  }
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    missing.push('um simbolo')
  }

  if (missing.length > 0) {
    requirements.push(`inclua pelo menos ${joinRequirements(missing)}`)
  }

  if (requirements.length === 0) {
    return ''
  }

  return `${capitalize(joinRequirements(requirements))}.`
}

function joinRequirements(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? ''
  }

  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
}

function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value
}
