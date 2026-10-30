package online.toppershelf.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Home-screen widget "Days left": the next upcoming countdown, as a big number of days.
 *
 * The app saves the person's countdowns ([{ title, date: "YYYY-MM-DD" }]) in this app's private preferences
 * (CountdownWidgetPlugin). The widget works out the days left itself every time it draws, so it needs no network,
 * no background service and no permission. Android redraws it about once an hour and whenever the app saves a new list.
 * Tapping it opens the app. When the person signs out the list is emptied, so no private titles stay on the home screen.
 */
public class CountdownWidgetProvider extends AppWidgetProvider {
    static final String PREFS = "toppershelf_widget";
    static final String KEY_ITEMS = "items";
    private static final long DAY_MS = 86_400_000L;

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        manager.updateAppWidget(ids, build(context));
    }

    /** Redraws every widget on the home screen (called after the app saves a new list). */
    static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, CountdownWidgetProvider.class));
        if (ids.length > 0) manager.updateAppWidget(ids, build(context));
    }

    private static final class Entry {
        final String title;
        final int days;

        Entry(String title, int days) {
            this.title = title;
            this.days = days;
        }
    }

    static RemoteViews build(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_countdown);
        List<Entry> upcoming = upcoming(context);
        String spoken;
        if (upcoming.isEmpty()) {
            views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_label));
            views.setTextViewText(R.id.widget_number, "–");
            views.setTextViewText(R.id.widget_label, context.getString(R.string.widget_empty));
            views.setTextViewText(R.id.widget_next, "");
            spoken = context.getString(R.string.widget_empty_description);
        } else {
            Entry first = upcoming.get(0);
            String label = context.getString(first.days == 0 ? R.string.widget_today : first.days == 1 ? R.string.widget_day_left : R.string.widget_days_left);
            views.setTextViewText(R.id.widget_title, first.title);
            views.setTextViewText(R.id.widget_number, String.valueOf(first.days));
            views.setTextViewText(R.id.widget_label, label);
            if (upcoming.size() > 1) {
                Entry next = upcoming.get(1);
                views.setTextViewText(R.id.widget_next, context.getString(R.string.widget_next, next.title, next.days));
            } else {
                views.setTextViewText(R.id.widget_next, "");
            }
            spoken = first.title + ": " + first.days + " " + label;
        }
        views.setContentDescription(R.id.widget_root, spoken);

        Intent open = new Intent(context, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        views.setOnClickPendingIntent(
            R.id.widget_root,
            PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT)
        );
        return views;
    }

    /** Countdowns that are today or later, soonest first. Bad or missing data gives an empty list, never a crash. */
    private static List<Entry> upcoming(Context context) {
        List<Entry> list = new ArrayList<>();
        String json = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_ITEMS, "[]");
        long today = todayDay();
        try {
            JSONArray array = new JSONArray(json);
            for (int i = 0; i < array.length(); i++) {
                JSONObject item = array.optJSONObject(i);
                if (item == null) continue;
                String title = item.optString("title", "").trim();
                long day = parseDay(item.optString("date", ""));
                if (title.isEmpty() || day == Long.MIN_VALUE) continue;
                long days = day - today;
                if (days >= 0) list.add(new Entry(title, (int) Math.min(days, 99_999L)));
            }
        } catch (JSONException ignored) {
            /* unreadable list: show the empty widget */
        }
        Collections.sort(list, (a, b) -> Integer.compare(a.days, b.days));
        return list;
    }

    /** Day number of "YYYY-MM-DD" (whole days since 1970, calendar date only), or Long.MIN_VALUE if it cannot be read. */
    static long parseDay(String date) {
        String[] parts = date.split("-");
        if (parts.length != 3) return Long.MIN_VALUE;
        try {
            return dayNumber(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]) - 1, Integer.parseInt(parts[2]));
        } catch (NumberFormatException e) {
            return Long.MIN_VALUE;
        }
    }

    /** Today's date in the phone's own time zone, as the same day number. Same rule as the app's "days until". */
    static long todayDay() {
        Calendar now = Calendar.getInstance();
        return dayNumber(now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DAY_OF_MONTH));
    }

    /** Using UTC for both sides means daylight-saving changes can never make a countdown off by one day. */
    private static long dayNumber(int year, int month0, int day) {
        Calendar utc = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        utc.clear();
        utc.set(year, month0, day);
        return Math.floorDiv(utc.getTimeInMillis(), DAY_MS);
    }
}
