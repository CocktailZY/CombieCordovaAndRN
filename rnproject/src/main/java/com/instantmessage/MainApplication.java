package com.instantmessage;

import android.app.Application;
import android.content.Intent;
import android.os.Bundle;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.benwixen.rnfilesystem.RNFileSystemPackage;
import com.cnull.apkinstaller.ApkInstallerPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.filepicker.FilePickerPackage;
import com.imagepicker.ImagePickerPackage;
import com.jeepeng.react.xgpush.PushPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import com.philipphecht.RNDocViewerPackage;
import com.rnfs.RNFSPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.zmxv.RNSound.RNSoundPackage;
import me.neo.react.StatusBarPackage;
import org.pgsqlite.SQLitePluginPackage;
import org.reactnative.camera.RNCameraPackage;
import org.wonday.pdf.RCTPdfView;
import rnxmpp.RNXMPPPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }
//        private CordovaPluginPackage cordovaPluginPackage;
        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNGestureHandlerPackage(),
                    new RCTPdfView(),
                    new RNFetchBlobPackage(),
                    new PushPackage(),
                    new RNDocViewerPackage(),
                    new FilePickerPackage(),
                    new ApkInstallerPackage(),
                    new RNFSPackage(),
                    new ReactNativeAudioPackage(),
                    new RNSoundPackage(),
                    new ImagePickerPackage(),
                    new RNFileSystemPackage(),
                    new VectorIconsPackage(),
                    new RNXMPPPackage(),
                    new RNDeviceInfo(),
                    new SQLitePluginPackage(),
                    new IMPackage(),
                    new StatusBarPackage(),
                    new RNCameraPackage(),
                    new NetworkPackage()
            );
        }

//        @Override
//        protected void onCreate(Bundle savedInstanceState) {
//            super.onCreate(savedInstanceState);
//            cordovaPluginPackage.setSavedInstanceState(savedInstanceState);
//        }
//
//        @Override
//        public void onActivityResult(int requestCode, int resultCode, Intent intent) {
//            super.onActivityResult(requestCode, resultCode, intent);
//            cordovaPluginPackage.onActivityResult(requestCode, resultCode, intent);
//        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
