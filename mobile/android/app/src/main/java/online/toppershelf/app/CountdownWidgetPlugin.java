package online.toppershelf.app;

import android.content.Context;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Hands the person's countdowns to the home-screen widget. The web side calls set({ items }) when the app opens and
 * whenever the list changes, and set({ items: [] }) on sign-out. The list is stored in this app's private preferences only.
 */
@CapacitorPlugin(name = "CountdownWidget")
public class CountdownWidgetPlugin extends Plugin {
    @PluginMethod
    public void set(PluginCall call) {
        JSArray items = call.getArray("items");
        String json = items == null ? "[]" : items.toString();
        if (json.length() > 50_000) {
            call.reject("Too many countdowns.");
            return;
        }
        getContext()
            .getSharedPreferences(CountdownWidgetProvider.PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(CountdownWidgetProvider.KEY_ITEMS, json)
            .apply();
        CountdownWidgetProvider.refreshAll(getContext());
        call.resolve();
    }
}
