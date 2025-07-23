import remoteConfig from "@react-native-firebase/remote-config";
import { ErrorLog } from "./log";
import { DPlatform } from "../utils";

export const firebaseKeys = {
    latest_needed_app_version_android: "latest_needed_app_version_android",
    latest_needed_app_version_ios: "latest_needed_app_version_ios",
};

export const firebaseDefaults = {
    [firebaseKeys.latest_needed_app_version_android]: "1.0.0",
    [firebaseKeys.latest_needed_app_version_ios]: "1.0.0",
};

export const InitRemoteConfig = async () => {
    try {
        await remoteConfig().setDefaults(firebaseDefaults);
        await remoteConfig().setConfigSettings({
            minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000,
        });
        await remoteConfig().fetchAndActivate();
    } catch (error) {
        ErrorLog(`Error initializating app version: ${error}`);
    }
};

export const GetRequiredAppVersion = async () => {
    try {
        let appVersion = null;
        if (DPlatform.isAndroid) {
            appVersion = remoteConfig().getValue(firebaseKeys.latest_needed_app_version_android).asString();
        } else if (DPlatform.isIOS) {
            appVersion = remoteConfig().getValue(firebaseKeys.latest_needed_app_version_ios).asString();
        }
        return appVersion;
    } catch (error) {
        ErrorLog(`Error checking app version: ${error}`);
    }
};
