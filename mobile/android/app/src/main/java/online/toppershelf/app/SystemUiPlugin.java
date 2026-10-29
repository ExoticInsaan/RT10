package online.toppershelf.app;

import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * The app sits between the phone's status bar and navigation bar (Capacitor pads it by their height).
 * The strips behind those bars show the window background, so this paints them in the colour of the current screen:
 * `top` behind the status bar, `bottom` behind the navigation keys or gesture bar. Android 15+ no longer lets an app
 * colour the status bar directly, which is why the old StatusBar colour call alone is not enough.
 */
@CapacitorPlugin(name = "SystemUi")
public class SystemUiPlugin extends Plugin {
    @PluginMethod
    public void setBars(PluginCall call) {
        final int top;
        final int bottom;
        try {
            top = Color.parseColor(call.getString("top", "#fffbf7"));
            bottom = Color.parseColor(call.getString("bottom", "#fffbf7"));
        } catch (IllegalArgumentException e) {
            call.reject("Bad colour.");
            return;
        }
        getActivity().runOnUiThread(() -> {
            View decor = getActivity().getWindow().getDecorView();
            // Only the thin strips at the top and bottom are visible, so a simple vertical blend reads as two colours.
            decor.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, new int[] { top, bottom }));
            call.resolve();
        });
    }
}
