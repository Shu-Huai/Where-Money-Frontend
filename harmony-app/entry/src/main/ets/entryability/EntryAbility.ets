import { AbilityConstant, Configuration, ConfigurationConstant, UIAbility, Want } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { resourceManager } from '@kit.LocalizationKit';
import { attachMainWindow } from '../systembar/SystemBar';
import { setHarmonySystemTheme } from '../pages/Index';

export default class EntryAbility extends UIAbility {
  onCreate(_want: Want, _launchParam: AbilityConstant.LaunchParam): void {
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    const mainWindow = windowStage.getMainWindowSync();
    attachMainWindow(mainWindow);
    mainWindow.setWindowLayoutFullScreen(true);
    mainWindow.setWindowSystemBarProperties({
      statusBarColor: '#00000000',
      navigationBarColor: '#00000000'
    });

    this.context.resourceManager.getConfiguration().then((configuration) => {
      const isDark = configuration.colorMode === resourceManager.ColorMode.DARK;
      setTimeout(() => {
        setHarmonySystemTheme(isDark);
      }, 1000);
    });

    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        console.error(`Failed to load Where Money page: ${JSON.stringify(err)}`);
      }
    });
  }

  onConfigurationUpdate(newConfig: Configuration): void {
    setHarmonySystemTheme(newConfig.colorMode === ConfigurationConstant.ColorMode.COLOR_MODE_DARK);
  }
}
