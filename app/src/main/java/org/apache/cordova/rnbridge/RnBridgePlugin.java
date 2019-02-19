package org.apache.cordova.rnbridge;

import android.content.Intent;
import com.instantmessage.MainActivity;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;

import static android.support.v4.content.ContextCompat.startActivity;


/**
 * @program: CombieCordovaAndRN
 * @description: cordova与rn通信工具
 * @author: CocktailZy
 * @create: 2019-02-13 09:46
 **/
public class RnBridgePlugin extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        if ("jumpToRNIndex".equals(action)) {
            jumpToRNIndex();
        }
        return true;
    }

    private void jumpToRNIndex() {
        CordovaInterface cordova = this.cordova;
        Intent intent = new Intent(cordova.getActivity(), MainActivity.class);
        cordova.startActivityForResult(this,intent,0);
    }
}
