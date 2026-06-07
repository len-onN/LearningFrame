import { spawnSync } from 'node:child_process'
import http from 'node:http'
import https from 'node:https'

const compose = ['compose', '-p', 'learningframe-e2e', '-f', 'docker-compose.e2e.yml']
const backendUrl = process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:18081'
const frontendUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:18080'

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options
  })
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} falhou com codigo ${result.status}`)
  }
}

async function waitForHttp(url, label) {
  const deadline = Date.now() + 120_000
  let lastError = ''

  while (Date.now() < deadline) {
    try {
      const statusCode = await requestStatus(url)
      if (statusCode >= 200 && statusCode < 400) {
        return
      }
      lastError = `HTTP ${statusCode}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error(`${label} nao ficou pronto em tempo util: ${lastError}`)
}

function requestStatus(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const request = client.get(url, (response) => {
      response.resume()
      response.on('end', () => resolve(response.statusCode ?? 0))
    })
    request.setTimeout(5000, () => {
      request.destroy(new Error('timeout'))
    })
    request.on('error', reject)
  })
}

let exitCode = 0

try {
  run('docker', [...compose, 'down', '-v', '--remove-orphans'])
  run('docker', [...compose, 'up', '-d', '--build', '--wait'])
  await waitForHttp(`${backendUrl}/api/decks/public`, 'backend e2e')
  await waitForHttp(frontendUrl, 'frontend e2e')
  run('npm', ['--prefix', 'frontend', 'run', 'e2e:test'])
} catch (error) {
  exitCode = 1
  console.error(error instanceof Error ? error.message : error)
} finally {
  const result = spawnSync('docker', [...compose, 'down', '-v', '--remove-orphans'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })
  if (result.status !== 0) {
    exitCode = result.status ?? 1
  }
}

process.exit(exitCode)
