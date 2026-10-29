package online.toppershelf.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.LabeledIntent;
import android.content.pm.PackageManager;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

/**
 * Sends a story card straight to Instagram Stories or WhatsApp Status,
 * instead of the general Android share sheet (which only lists chats and apps).
 */
@CapacitorPlugin(name = "StoryShare")
public class StorySharePlugin extends Plugin {
    private static final String INSTAGRAM = "com.instagram.android";
    private static final String WHATSAPP = "com.whatsapp";
    private static final String WHATSAPP_BUSINESS = "com.whatsapp.w4b";

    private boolean installed(String pkg) {
        try {
            getContext().getPackageManager().getPackageInfo(pkg, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private String whatsappPackage() {
        if (installed(WHATSAPP)) return WHATSAPP;
        if (installed(WHATSAPP_BUSINESS)) return WHATSAPP_BUSINESS;
        return null;
    }

    /** Turns the file:// path from the Filesystem plugin into a content:// URI other apps may read. */
    private Uri contentUri(String fileUri) {
        String path = Uri.parse(fileUri).getPath();
        File file = new File(path);
        return FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
    }

    /**
     * Opens Android's normal share dialog with the card, and adds "Instagram Story" and "WhatsApp Status"
     * to the app row (next to LinkedIn, Instagram and so on) through EXTRA_INITIAL_INTENTS.
     */
    @PluginMethod
    public void shareImage(PluginCall call) {
        String fileUri = call.getString("uri");
        if (fileUri == null) {
            call.reject("uri is required");
            return;
        }
        try {
            Uri uri = contentUri(fileUri);
            String text = call.getString("text");
            String title = call.getString("title", "Share your card");

            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("image/png");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            if (text != null && !text.isEmpty()) send.putExtra(Intent.EXTRA_TEXT, text);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            java.util.ArrayList<Intent> extras = new java.util.ArrayList<>();

            if (installed(INSTAGRAM)) {
                Intent story = new Intent("com.instagram.share.ADD_TO_STORY");
                story.setDataAndType(uri, "image/png");
                story.setPackage(INSTAGRAM);
                story.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                getContext().grantUriPermission(INSTAGRAM, uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                extras.add(new LabeledIntent(story, INSTAGRAM, "Instagram Story", 0));
            }

            String wa = whatsappPackage();
            if (wa != null) {
                Intent status = new Intent(Intent.ACTION_SEND);
                status.setType("image/png");
                status.setPackage(wa);
                status.putExtra(Intent.EXTRA_STREAM, uri);
                if (text != null && !text.isEmpty()) status.putExtra(Intent.EXTRA_TEXT, text);
                status.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                getContext().grantUriPermission(wa, uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                extras.add(new LabeledIntent(status, wa, "WhatsApp Status", 0));
            }

            Intent chooser = Intent.createChooser(send, title);
            if (!extras.isEmpty()) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, extras.toArray(new Intent[0]));
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(chooser);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void available(PluginCall call) {
        JSObject res = new JSObject();
        res.put("instagram", installed(INSTAGRAM));
        res.put("whatsapp", whatsappPackage() != null);
        call.resolve(res);
    }

    @PluginMethod
    public void shareToInstagramStory(PluginCall call) {
        String fileUri = call.getString("uri");
        if (fileUri == null) {
            call.reject("uri is required");
            return;
        }
        if (!installed(INSTAGRAM)) {
            call.reject("Instagram is not installed");
            return;
        }
        try {
            Uri uri = contentUri(fileUri);
            Intent intent = new Intent("com.instagram.share.ADD_TO_STORY");
            intent.setDataAndType(uri, "image/png");
            intent.setPackage(INSTAGRAM);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            String appId = call.getString("appId");
            if (appId != null && !appId.isEmpty()) intent.putExtra("source_application", appId);
            getContext().grantUriPermission(INSTAGRAM, uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("Instagram Stories is not available");
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    /**
     * WhatsApp has no public "post to Status" intent. This opens WhatsApp's own picker with the card attached;
     * "My status" sits at the top of that list, so it is one tap.
     */
    @PluginMethod
    public void shareToWhatsApp(PluginCall call) {
        String fileUri = call.getString("uri");
        if (fileUri == null) {
            call.reject("uri is required");
            return;
        }
        String pkg = whatsappPackage();
        if (pkg == null) {
            call.reject("WhatsApp is not installed");
            return;
        }
        try {
            Uri uri = contentUri(fileUri);
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/png");
            intent.setPackage(pkg);
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            String text = call.getString("text");
            if (text != null && !text.isEmpty()) intent.putExtra(Intent.EXTRA_TEXT, text);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().grantUriPermission(pkg, uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("WhatsApp could not open");
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
