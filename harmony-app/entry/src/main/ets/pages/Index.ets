import { webview } from '@kit.ArkWeb';
import { updateSystemBarContentColor } from '../systembar/SystemBar';

let currentController: webview.WebviewController | undefined;
let pageLoaded: boolean = false;
let currentSystemDark: boolean | undefined;

class SystemBarBridge {
  setDarkMode(isDark: boolean): void {
    currentSystemDark = isDark;
    updateSystemBarContentColor(isDark);
  }
}

export function setHarmonySystemTheme(isDark: boolean): void {
  currentSystemDark = isDark;
  updateSystemBarContentColor(isDark);
  if (!currentController || !pageLoaded) {
    return;
  }
  currentController.runJavaScript(
    `window.__WHERE_MONEY_SYSTEM_DARK__ = ${isDark}; window.dispatchEvent(new CustomEvent('where-money-system-theme-change', { detail: { dark: ${isDark} } }))`
  ).catch((err: Error) => {
    console.error(`[WhereMoney] system theme sync failed: ${err.message}`);
  });
}

function getDocumentStartThemeScript(): string {
  const isDark = currentSystemDark === true;
  return `(function () {
    var dark = ${isDark};
    window.__WHERE_MONEY_SYSTEM_DARK__ = dark;
    function applyTheme() {
      if (document.documentElement) {
        document.documentElement.classList.toggle('dark', dark);
      }
    }
    applyTheme();
    document.addEventListener('DOMContentLoaded', applyTheme, { once: true });
  })();`;
}

@Entry
@Component
struct Index {
  private controller: webview.WebviewController = new webview.WebviewController();
  private systemBarBridge: SystemBarBridge = new SystemBarBridge();

  aboutToAppear(): void {
    currentController = this.controller;
  }

  build() {
    Stack() {
      Web({
        src: $rawfile('www/index.html'),
        controller: this.controller
      })
        .javaScriptOnDocumentStart([{
          script: getDocumentStartThemeScript(),
          scriptRules: ['*']
        }])
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .onControllerAttached(() => {
          this.controller.registerJavaScriptProxy(
            this.systemBarBridge,
            'whereMoneySystemBar',
            ['setDarkMode']
          );
        })
        .onPageBegin(() => {
          pageLoaded = false;
        })
        .onPageEnd(() => {
          pageLoaded = true;
          if (currentSystemDark !== undefined) {
            setHarmonySystemTheme(currentSystemDark);
          }
        })
        .onConsole((event) => {
          const message = event.message.getMessage();
          if (message === '[WhereMoney][SystemBar] dark') {
            updateSystemBarContentColor(true);
          } else if (message === '[WhereMoney][SystemBar] light') {
            updateSystemBarContentColor(false);
          }
          console.info(`[WhereMoney][Web] ${message}`);
          return false;
        })
        .onErrorReceive((event) => {
          console.error(`[WhereMoney][Web] ${event.error.getErrorInfo()}`);
        })
        .width('100%')
        .height('100%')
    }
    .width('100%')
    .height('100%')
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.BOTTOM]);
  }
}
