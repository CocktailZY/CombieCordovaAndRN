package com.instantmessage;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
//import com.facebook.react.ReactActivity;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.benwixen.rnfilesystem.RNFileSystemPackage;
import com.cnull.apkinstaller.ApkInstallerPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactRootView;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.shell.MainReactPackage;
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

public class MainActivity extends AppCompatActivity implements DefaultHardwareBackBtnHandler {

    private final int OVERLAY_PERMISSION_REQ_CODE = 1;
    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
//        Intent intent = new Intent(RNMainActivity.this,MyReactActivity.class) ;
//        startActivity(intent) ;
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(getApplication())
                .setBundleAssetName("index.android.bundle")
                .setJSMainModulePath("index")
                .addPackages(Arrays.<ReactPackage>asList(
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
                ))
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();
        // 注意这里的MyReactNativeApp必须对应“index.js”中的
        // “AppRegistry.registerComponent()”的第一个参数
        mReactRootView.startReactApplication(mReactInstanceManager, "InstantMessage", null);
        Log.i("MyReactActivity", "测试ddd+++++++++++++++++++");
        setContentView(mReactRootView);
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == OVERLAY_PERMISSION_REQ_CODE) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(this)) {
                    // SYSTEM_ALERT_WINDOW permission not granted
                }
            }
        }
        mReactInstanceManager.onActivityResult(this, requestCode, resultCode, data);
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostPause(this);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostResume(this, this);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostDestroy(this);
        }
        if (mReactRootView != null) {
            mReactRootView.unmountReactApplication();
        }
    }

    @Override
    public void onBackPressed() {
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onBackPressed();
        } else {
            super.onBackPressed();
        }
    }
}