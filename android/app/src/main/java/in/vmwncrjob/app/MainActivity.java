package in.vmwncrjob.app;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    public MainActivity() {
        // Local plugin: not shipped as an npm package, so register it explicitly.
        registerPlugin(LiveUpdatePlugin.class);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge != null && bridge.getWebView() != null && bridge.getWebView().canGoBack()) {
                    bridge.getWebView().goBack();
                } else {
                    finish();
                }
            }
        });
    }

    @Override
    protected void load() {
        super.load();
        // Apply a bundle downloaded on a previous run before the site becomes visible.
        LiveUpdatePlugin.applyStoredBundle(bridge);
    }
}
