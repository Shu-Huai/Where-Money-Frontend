import { window } from '@kit.ArkUI';

let mainWindow: window.Window | undefined;

export function attachMainWindow(value: window.Window): void {
  mainWindow = value;
}

export function updateSystemBarContentColor(isDark: boolean): void {
  mainWindow?.setWindowSystemBarProperties({
    statusBarColor: '#00000000',
    navigationBarColor: '#00000000',
    statusBarContentColor: isDark ? '#FFFFFFFF' : '#FF000000',
    navigationBarContentColor: isDark ? '#FFFFFFFF' : '#FF000000'
  });
}
