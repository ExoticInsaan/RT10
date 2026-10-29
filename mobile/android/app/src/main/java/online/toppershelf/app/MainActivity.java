package online.toppershelf.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StorySharePlugin.class);
        registerPlugin(DownloadsPlugin.class); // saves downloads to Downloads / Pictures
        super.onCreate(savedInstanceState);
    }
}
