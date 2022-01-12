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
        return (...args) => { console.log(chalk.red('[E]'), ...args); }
        break;
      case 'warn':
        return (...args) => { console.log(chalk.yellow('[W]'), ...args); }
        break;
      case 'debug':
        return (...args) => { console.log(chalk.blue('[D]'), ...args); }
        break;
      case 'trace':
        return (...args) => { console.log(chalk.magenta('[T]'), ...args); }
        break;
      case 'info':
      default:
        return (...args) => { console.log(chalk.white('[I]'), ...args); }
        break;
    }
  }

  const VALID_LOG_LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error', 'silent' ];
  if(VALID_LOG_LEVELS.includes(defaultLevel)) {
    log.setDefaultLevel(defaultLevel);
  }
}

export default configurePuzzleLogging;
