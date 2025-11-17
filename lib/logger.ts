type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: Record<string, unknown>): void {
    const formatted = this.formatMessage('info', message, context)
    console.log(formatted)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const formatted = this.formatMessage('warn', message, context)
    console.warn(formatted)
  }

  error(message: string, context?: Record<string, unknown>): void {
    const formatted = this.formatMessage('error', message, context)
    console.error(formatted)
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, context)
      console.debug(formatted)
    }
  }
}

export const logger = new Logger()

