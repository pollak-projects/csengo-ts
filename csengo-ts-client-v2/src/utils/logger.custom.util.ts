import { format } from 'date-fns'
import * as colors from 'ansi-colors'

class CustomLogger {
  private readonly service: string

  constructor(service: string) {
    this.service = service
  }

  error(message: string, json?: object) {
    this.log('error', colors.red, message, json)
  }

  warn(message: string, json?: object) {
    this.log('warn', colors.yellow, message, json)
  }

  info(message: string, json?: object) {
    this.log('info', colors.blue, message, json)
  }

  http(message: string, json?: object) {
    this.log('http', colors.green, message, json)
  }

  verbose(message: string, json?: object) {
    this.log('verbose', colors.gray, message, json)
  }

  debug(message: string, json?: object) {
    this.log('debug', colors.cyan, message, json)
  }

  silly(message: string, json?: object) {
    this.log('silly', colors.magenta, message, json)
  }

  private log(level: string, color: (text: string) => string, message: string, json?: object) {
    const timestamp = format(new Date(), 'yyyy-MM-dd::HH:mm:ss')
    const logMessage = `${timestamp} [${color(level)}] [${this.service}]: ${message}`
    console.log(logMessage)
    if (json !== undefined) {
      console.log(JSON.stringify(json, null, 2))
    }
  }
}

const serviceLogger = (serviceName: string) => {
  return new CustomLogger(serviceName)
}

export default serviceLogger
