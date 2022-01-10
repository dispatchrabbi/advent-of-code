import log from 'loglevel';
import chalk from 'chalk';

function configurePuzzleLogging(defaultLevel = 'warn') {
  const _methodFactory = log.methodFactory;
  log.methodFactory = function(methodName, logLevel, loggerName) {
    if(loggerName !== 'puzzle') {
      return _methodFactory(methodName, logLevel, loggerName);
    }

    switch(methodName) {
      case 'error':
        return (...args) => { console.log(chalk.red('[ERROR]'), ...args); }
        break;
      case 'warn':
        return (...args) => { console.log(chalk.yellow('[WARN ]'), ...args); }
        break;
      case 'debug':
        return (...args) => { console.log(chalk.blue('[DEBUG]'), ...args); }
        break;
      case 'trace':
        return (...args) => { console.log(chalk.magenta('[TRACE]'), ...args); }
        break;
      case 'info':
      default:
        return (...args) => { console.log(chalk.white('[INFO ]'), ...args); }
        break;
    }
  }

  const VALID_LOG_LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error', 'silent' ];
  if(VALID_LOG_LEVELS.includes(defaultLevel)) {
    log.setDefaultLevel(defaultLevel);
  }
}

export default configurePuzzleLogging;
