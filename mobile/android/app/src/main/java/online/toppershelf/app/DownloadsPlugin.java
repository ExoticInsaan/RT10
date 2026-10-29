package online.toppershelf.app;

import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import androidx.annotation.RequiresApi;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;

/**
 * Saves files the app makes (PDFs, edited images, Fun Zone cards) into the phone's public folders using MediaStore:
 * images go to Pictures/TopperShelf (they show in the Gallery), everything else to Download/TopperShelf (Files app).
 * On Android 10 and newer an app may add its own files there with no permission. Android 9 and older get "UNSUPPORTED",
 * and the web side falls back to the Share sheet. Also opens or shares a saved file from the "Saved" message.
 */
@CapacitorPlugin(name = "Downloads")
public class DownloadsPlugin extends Plugin {
    private static final String FOLDER = "TopperShelf";

    @PluginMethod
    public void save(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Saving to Downloads needs Android 10 or newer.", "UNSUPPORTED");
            return;
        }
        String data = call.getString("data");
        String filename = call.getString("filename");
        String mime = call.getString("mimeType", "application/octet-stream");
        if (data == null || filename == null || filename.trim().isEmpty()) {
            call.reject("Missing file data or name.");
            return;
        }
        try {
            call.resolve(saveToMediaStore(Base64.decode(data, Base64.DEFAULT), cleanName(filename), mime));
        } catch (Exception e) {
            call.reject("Could not save the file.", e);
        }
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private JSObject saveToMediaStore(byte[] bytes, String name, String mime) throws Exception {
        boolean image = mime.startsWith("image/");
        Uri collection = image
            ? MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
            : MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        String root = image ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS;

        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
        values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
        values.put(MediaStore.MediaColumns.RELATIVE_PATH, root + "/" + FOLDER);
        values.put(MediaStore.MediaColumns.IS_PENDING, 1);

        ContentResolver resolver = getContext().getContentResolver();
        Uri uri = resolver.insert(collection, values);
        if (uri == null) throw new IllegalStateException("MediaStore refused the file");
        try (OutputStream out = resolver.openOutputStream(uri)) {
            if (out == null) throw new IllegalStateException("Could not open the file");
            out.write(bytes);
        } catch (Exception e) {
            resolver.delete(uri, null, null); // do not leave a half-written file behind
            throw e;
        }
        ContentValues done = new ContentValues();
        done.put(MediaStore.MediaColumns.IS_PENDING, 0);
        resolver.update(uri, done, null, null);

        JSObject result = new JSObject();
        result.put("uri", uri.toString());
        result.put("name", savedName(resolver, uri, name)); // Android adds " (1)" when the name is taken
        result.put("folder", image ? "Pictures" : "Downloads");
        return result;
    }

    private String savedName(ContentResolver resolver, Uri uri, String fallback) {
        try (Cursor c = resolver.query(uri, new String[] { MediaStore.MediaColumns.DISPLAY_NAME }, null, null, null)) {
            if (c != null && c.moveToFirst()) return c.getString(0);
        } catch (Exception ignored) {
            /* the saved file is fine; only the name shown in the message falls back */
        }
        return fallback;
    }

    private static String cleanName(String name) {
        String cleaned = name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_").trim();
        return cleaned.isEmpty() ? "file" : cleaned;
    }

    @PluginMethod
    public void open(PluginCall call) {
        Uri uri = parse(call);
        if (uri == null) return;
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, call.getString("mimeType", "*/*"));
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("No app on this phone can open this file.", "NO_APP");
        }
    }

    @PluginMethod
    public void share(PluginCall call) {
        Uri uri = parse(call);
        if (uri == null) return;
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType(call.getString("mimeType", "*/*"));
        send.putExtra(Intent.EXTRA_STREAM, uri);
        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        Intent chooser = Intent.createChooser(send, "Share file");
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(chooser);
        call.resolve();
    }

    private Uri parse(PluginCall call) {
        String value = call.getString("uri");
        if (value == null || !value.startsWith("content://")) {
            call.reject("Missing file address.");
            return null;
        }
        return Uri.parse(value);
    }
}
