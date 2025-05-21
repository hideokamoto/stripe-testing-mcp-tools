/**
 * MCP Logger - Simple logging utility for MCP (Microservices Communication Protocol)
 */

import * as fs from 'fs';
import * as path from 'path';

// ログレベルの定義
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// ロガー設定オプション
export interface MCPLoggerOptions {
  level?: LogLevel;
  logFile?: string;
  prefix?: string;
  includeTimestamp?: boolean;
}

export class MCPLogger {
  private level: LogLevel;
  private logFile: fs.WriteStream | null = null;
  private prefix: string;
  private includeTimestamp: boolean;

  constructor(options: MCPLoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.prefix = options.prefix ?? 'MCP';
    this.includeTimestamp = options.includeTimestamp ?? true;

    // ログファイルの設定
    if (options.logFile) {
      const logDir = path.dirname(options.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      this.logFile = fs.createWriteStream(options.logFile, { flags: 'a' });
    }
  }

  /**
   * ログメッセージを出力
   * MCPモデルを尊重: stdoutはJSON-RPCレスポンス専用、stderrをログに使用
   */
  private log(level: LogLevel, message: string): void {
    if (level < this.level) {
      return;
    }

    const timestamp = this.includeTimestamp ? `[${new Date().toISOString()}] ` : '';
    const levelStr = LogLevel[level].padEnd(5);
    const formattedMessage = `${timestamp}[${this.prefix}] [${levelStr}] ${message}`;

    // console.errorを使用してstderrに出力
    console.error(formattedMessage);

    // ファイルにもロギング（設定されている場合）
    if (this.logFile) {
      this.logFile.write(`${formattedMessage}\n`);
    }
  }

  // 各ログレベルのメソッド
  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  // ロガーのクローズ
  close(): void {
    if (this.logFile) {
      this.logFile.end();
      this.logFile = null;
    }
  }
}
export const logger = new MCPLogger({
  level: LogLevel.INFO,
});
