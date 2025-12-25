import { describe, it, expect } from 'vitest';
import { LogLevel, formatLogMessage, shouldLog } from './logger.js';

describe('formatLogMessage', () => {
  it('タイムスタンプを含むログメッセージをフォーマットする', () => {
    const result = formatLogMessage(LogLevel.INFO, 'Test message', 'TEST', true);

    expect(result).toMatch(/^\[.*\] \[TEST\] \[INFO \] Test message$/);
  });

  it('タイムスタンプを含まないログメッセージをフォーマットする', () => {
    const result = formatLogMessage(LogLevel.DEBUG, 'Debug message', 'APP', false);

    expect(result).toBe('[APP] [DEBUG] Debug message');
  });

  it('異なるログレベルで正しくフォーマットする', () => {
    const debugResult = formatLogMessage(LogLevel.DEBUG, 'Debug', 'TEST', false);
    const infoResult = formatLogMessage(LogLevel.INFO, 'Info', 'TEST', false);
    const warnResult = formatLogMessage(LogLevel.WARN, 'Warn', 'TEST', false);
    const errorResult = formatLogMessage(LogLevel.ERROR, 'Error', 'TEST', false);

    expect(debugResult).toBe('[TEST] [DEBUG] Debug');
    expect(infoResult).toBe('[TEST] [INFO ] Info');
    expect(warnResult).toBe('[TEST] [WARN ] Warn');
    expect(errorResult).toBe('[TEST] [ERROR] Error');
  });

  it('異なるプレフィックスで正しくフォーマットする', () => {
    const result1 = formatLogMessage(LogLevel.INFO, 'Message', 'PREFIX1', false);
    const result2 = formatLogMessage(LogLevel.INFO, 'Message', 'PREFIX2', false);

    expect(result1).toBe('[PREFIX1] [INFO ] Message');
    expect(result2).toBe('[PREFIX2] [INFO ] Message');
  });
});

describe('shouldLog', () => {
  it('メッセージレベルが現在レベル以上の場合、trueを返す', () => {
    expect(shouldLog(LogLevel.INFO, LogLevel.DEBUG)).toBe(true);
    expect(shouldLog(LogLevel.INFO, LogLevel.INFO)).toBe(true);
    expect(shouldLog(LogLevel.WARN, LogLevel.INFO)).toBe(true);
    expect(shouldLog(LogLevel.ERROR, LogLevel.WARN)).toBe(true);
  });

  it('メッセージレベルが現在レベル未満の場合、falseを返す', () => {
    expect(shouldLog(LogLevel.DEBUG, LogLevel.INFO)).toBe(false);
    expect(shouldLog(LogLevel.INFO, LogLevel.WARN)).toBe(false);
    expect(shouldLog(LogLevel.WARN, LogLevel.ERROR)).toBe(false);
  });

  it('同じレベルの場合、trueを返す', () => {
    expect(shouldLog(LogLevel.DEBUG, LogLevel.DEBUG)).toBe(true);
    expect(shouldLog(LogLevel.INFO, LogLevel.INFO)).toBe(true);
    expect(shouldLog(LogLevel.WARN, LogLevel.WARN)).toBe(true);
    expect(shouldLog(LogLevel.ERROR, LogLevel.ERROR)).toBe(true);
  });

  it('NONEレベルの場合、常にfalseを返す', () => {
    expect(shouldLog(LogLevel.DEBUG, LogLevel.NONE)).toBe(false);
    expect(shouldLog(LogLevel.INFO, LogLevel.NONE)).toBe(false);
    expect(shouldLog(LogLevel.WARN, LogLevel.NONE)).toBe(false);
    expect(shouldLog(LogLevel.ERROR, LogLevel.NONE)).toBe(false);
  });
});
