package online.toppershelf.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StorySharePlugin.class);
        registerPlugin(DownloadsPlugin.class); // saves downloads to Downloads / Pictures
        registerPlugin(SystemUiPlugin.class); // colours the strips behind the status bar and navigation bar
        super.onCreate(savedInstanceState);
        getWindow().getDecorView().setBackgroundColor(0xFFFFFBF7);
    }
}
