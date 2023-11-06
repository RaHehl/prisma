import { jestConsoleContext, jestContext } from '@prisma/get-platform'
import path from 'path'
import { cwd } from 'process'

import { DebugInfo } from '../../DebugInfo'

const ctx = jestContext.new().add(jestConsoleContext()).assemble()

const originalEnv = { ...process.env }

function cleanSnapshot(str: string): string {
  str = str.replace(new RegExp('(Path: ).*', 'g'), '$1 REDACTED_PATH')
  return str
}

const envVars = {
  CI: 'true',
  GITHUB_ACTIONS: 'true',
  DEBUG: 'something',
  NODE_ENV: 'test',
  RUST_LOG: 'trace',
  RUST_BACKTRACE: 'full',
  NO_COLOR: 'true',
  TERM: 'dumb',
  NODE_TLS_REJECT_UNAUTHORIZED: 'true',
  NO_PROXY: '*',
  http_proxy: 'http://localhost',
  HTTP_PROXY: 'http://localhost',
  https_proxy: 'https://localhost',
  HTTPS_PROXY: 'https://localhost',
  PRISMA_DISABLE_WARNINGS: 'true',
  PRISMA_HIDE_PREVIEW_FLAG_WARNINGS: 'true',
  PRISMA_HIDE_UPDATE_MESSAGE: 'true',
  PRISMA_ENGINES_MIRROR: 'http://localhost',
  PRISMA_BINARIES_MIRROR: 'http://localhost',
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: 'true',
  BINARY_DOWNLOAD_VERSION: 'true',
  PRISMA_CLI_QUERY_ENGINE_TYPE: 'library',
  PRISMA_CLIENT_ENGINE_TYPE: 'library',
  PRISMA_QUERY_ENGINE_BINARY: 'some/path',
  PRISMA_QUERY_ENGINE_LIBRARY: 'some/path',
  PRISMA_SCHEMA_ENGINE_BINARY: 'some/path',
  PRISMA_MIGRATION_ENGINE_BINARY: 'true',
  PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true',
  PRISMA_SKIP_POSTINSTALL_GENERATE: 'true',
  PRISMA_GENERATE_IN_POSTINSTALL: 'true',
  PRISMA_GENERATE_DATAPROXY: 'true',
  PRISMA_GENERATE_NO_ENGINE: 'true',
  PRISMA_SHOW_ALL_TRACES: 'true',
  PRISMA_CLIENT_NO_RETRY: 'true',
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: 'true',
  PRISMA_MIGRATE_SKIP_GENERATE: 'true',
  PRISMA_MIGRATE_SKIP_SEED: 'true',
  BROWSER: 'something',
}

describe('debug', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, ...envVars }
  })
  afterAll(() => {
    process.env = { ...originalEnv }
  })

  it('should succeed when env vars are NOT set', async () => {
    ctx.fixture('example-project/prisma')

    // Make sure all env vars are set to undefined
    const envVarsSetToUndefined = Object.fromEntries(Object.keys(envVars).map((key) => [key, undefined]))
    Object.assign(process.env, envVarsSetToUndefined)
    // To make sure the terminal is always detected
    // as non interactive, localy and in CI
    process.env.TERM = 'dumb'

    const result = await DebugInfo.new().parse([])!

    expect(cleanSnapshot(result as string)).toMatchInlineSnapshot(`
      -- Prisma schema --
      Path:  REDACTED_PATH

      -- Local cache directory for engines files --
      Path:  REDACTED_PATH

      -- Environment variables --
      When not set, the line is dimmed and no value is displayed.
      When set, the line is bold and the value is inside the \`\` backticks.

      For general debugging
      - CI:
      - DEBUG:
      - NODE_ENV:
      - RUST_LOG:
      - RUST_BACKTRACE:
      - NO_COLOR:
      - TERM: \`dumb\`
      - NODE_TLS_REJECT_UNAUTHORIZED:
      - NO_PROXY:
      - http_proxy:
      - HTTP_PROXY:
      - https_proxy:
      - HTTPS_PROXY:

      For more information about Prisma environment variables:
      See https://www.prisma.io/docs/reference/api-reference/environment-variables-reference

      For hiding messages
      - PRISMA_DISABLE_WARNINGS:
      - PRISMA_HIDE_PREVIEW_FLAG_WARNINGS:
      - PRISMA_HIDE_UPDATE_MESSAGE:

      For downloading engines
      - PRISMA_ENGINES_MIRROR:
      - PRISMA_BINARIES_MIRROR: - (deprecated)
      - PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING:
      - BINARY_DOWNLOAD_VERSION:

      For configuring the Query Engine Type
      - PRISMA_CLI_QUERY_ENGINE_TYPE:
      - PRISMA_CLIENT_ENGINE_TYPE:

      For custom engines
      - PRISMA_QUERY_ENGINE_BINARY:
      - PRISMA_QUERY_ENGINE_LIBRARY:
      - PRISMA_SCHEMA_ENGINE_BINARY:
      - PRISMA_MIGRATION_ENGINE_BINARY:

      For the "postinstall" npm hook
      - PRISMA_GENERATE_SKIP_AUTOINSTALL:
      - PRISMA_SKIP_POSTINSTALL_GENERATE:
      - PRISMA_GENERATE_IN_POSTINSTALL:

      For "prisma generate"
      - PRISMA_GENERATE_DATAPROXY:
      - PRISMA_GENERATE_NO_ENGINE:

      For Prisma Client
      - PRISMA_SHOW_ALL_TRACES:
      - PRISMA_CLIENT_NO_RETRY: - (Binary engine only)

      For Prisma Migrate
      - PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK:
      - PRISMA_MIGRATE_SKIP_GENERATE:
      - PRISMA_MIGRATE_SKIP_SEED:

      For Prisma Studio
      - BROWSER:

      -- Terminal is interactive? --
      false

      -- CI detected? --
      No

    `)
  })

  it('should succeed when env vars are set', async () => {
    ctx.fixture('example-project/prisma')
    const result = await DebugInfo.new().parse([])!

    expect(cleanSnapshot(result as string)).toMatchInlineSnapshot(`
      -- Prisma schema --
      Path:  REDACTED_PATH

      -- Local cache directory for engines files --
      Path:  REDACTED_PATH

      -- Environment variables --
      When not set, the line is dimmed and no value is displayed.
      When set, the line is bold and the value is inside the \`\` backticks.

      For general debugging
      - CI: \`true\`
      - DEBUG: \`something\`
      - NODE_ENV: \`test\`
      - RUST_LOG: \`trace\`
      - RUST_BACKTRACE: \`full\`
      - NO_COLOR: \`true\`
      - TERM: \`dumb\`
      - NODE_TLS_REJECT_UNAUTHORIZED: \`true\`
      - NO_PROXY: \`*\`
      - http_proxy: \`http://localhost\`
      - HTTP_PROXY: \`http://localhost\`
      - https_proxy: \`https://localhost\`
      - HTTPS_PROXY: \`https://localhost\`

      For more information about Prisma environment variables:
      See https://www.prisma.io/docs/reference/api-reference/environment-variables-reference

      For hiding messages
      - PRISMA_DISABLE_WARNINGS: \`true\`
      - PRISMA_HIDE_PREVIEW_FLAG_WARNINGS: \`true\`
      - PRISMA_HIDE_UPDATE_MESSAGE: \`true\`

      For downloading engines
      - PRISMA_ENGINES_MIRROR: \`http://localhost\`
      - PRISMA_BINARIES_MIRROR: \`http://localhost\` - (deprecated)
      - PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: \`true\`
      - BINARY_DOWNLOAD_VERSION: \`true\`

      For configuring the Query Engine Type
      - PRISMA_CLI_QUERY_ENGINE_TYPE: \`library\`
      - PRISMA_CLIENT_ENGINE_TYPE: \`library\`

      For custom engines
      - PRISMA_QUERY_ENGINE_BINARY: \`some/path\`
      - PRISMA_QUERY_ENGINE_LIBRARY: \`some/path\`
      - PRISMA_SCHEMA_ENGINE_BINARY: \`some/path\`
      - PRISMA_MIGRATION_ENGINE_BINARY: \`true\`

      For the "postinstall" npm hook
      - PRISMA_GENERATE_SKIP_AUTOINSTALL: \`true\`
      - PRISMA_SKIP_POSTINSTALL_GENERATE: \`true\`
      - PRISMA_GENERATE_IN_POSTINSTALL: \`true\`

      For "prisma generate"
      - PRISMA_GENERATE_DATAPROXY: \`true\`
      - PRISMA_GENERATE_NO_ENGINE: \`true\`

      For Prisma Client
      - PRISMA_SHOW_ALL_TRACES: \`true\`
      - PRISMA_CLIENT_NO_RETRY: \`true\` - (Binary engine only)

      For Prisma Migrate
      - PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: \`true\`
      - PRISMA_MIGRATE_SKIP_GENERATE: \`true\`
      - PRISMA_MIGRATE_SKIP_SEED: \`true\`

      For Prisma Studio
      - BROWSER: \`something\`

      -- Terminal is interactive? --
      false

      -- CI detected? --
      Yes

    `)
  })

  it('should succeed with --schema', async () => {
    ctx.fixture('example-project/prisma')
    await expect(DebugInfo.new().parse(['--schema=schema.prisma'])).resolves.toContain(
      path.join(cwd(), 'schema.prisma'),
    )
  })

  it('should succeed with incorrect --schema path', async () => {
    await expect(DebugInfo.new().parse(['--schema=does-not-exists.prisma'])).resolves.toContain(
      "Path: Provided --schema at does-not-exists.prisma doesn't exist.",
    )
  })
})