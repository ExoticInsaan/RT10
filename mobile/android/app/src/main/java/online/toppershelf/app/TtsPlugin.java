package online.toppershelf.app;

import android.os.Bundle;
import android.util.Base64;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Locale;
import java.util.Set;

/**
 * Reads text aloud with the phone's own text-to-speech voices.
 * Android's WebView has no `speechSynthesis` (the browser feature Notes to Audio uses), so src/speech.ts adds one
 * that talks to this plugin. The page asks for `voices`, calls `speak` for one sentence at a time and hears
 * `ttsDone` / `ttsError` when that sentence ends.
 */
@CapacitorPlugin(name = "Tts")
public class TtsPlugin extends Plugin {
    private TextToSpeech tts;
    private volatile boolean ready = false;
    private volatile boolean failed = false;

    @Override
    public void load() {
        tts = new TextToSpeech(getContext(), status -> {
            if (status != TextToSpeech.SUCCESS) {
                failed = true;
                return;
            }
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String utteranceId) { }

                @Override public void onDone(String utteranceId) { tell("ttsDone", utteranceId); }

                @Override public void onError(String utteranceId) { tell("ttsError", utteranceId); }

                @Override public void onError(String utteranceId, int errorCode) { tell("ttsError", utteranceId); }

                // stop() lands here. The page already knows it cancelled, so nothing is sent.
                @Override public void onStop(String utteranceId, boolean interrupted) { }
            });
            ready = true;
        });
    }

    private void tell(String event, String id) {
        JSObject data = new JSObject();
        data.put("id", id);
        notifyListeners(event, data);
    }

    /** The engine starts a moment after the app does, so the page asks again until `ready` is true. */
    @PluginMethod
    public void voices(PluginCall call) {
        JSObject result = new JSObject();
        JSArray list = new JSArray();
        if (ready) {
            try {
                Set<Voice> all = tts.getVoices();
                if (all != null) {
                    for (Voice v : all) {
                        if (v.getFeatures() != null && v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                        JSObject o = new JSObject();
                        o.put("id", v.getName());
                        o.put("name", v.getLocale().getDisplayName());
                        o.put("lang", v.getLocale().toLanguageTag());
                        o.put("local", !v.isNetworkConnectionRequired());
                        o.put("quality", v.getQuality());
                        list.put(o);
                    }
                }
            } catch (Exception e) {
                // Some phones throw here: the page then shows its "no voice found" message.
            }
        }
        result.put("ready", ready);
        result.put("failed", failed);
        result.put("voices", list);
        call.resolve(result);
    }

    @PluginMethod
    public void speak(PluginCall call) {
        if (!ready) {
            call.reject("Text to speech is not ready.");
            return;
        }
        String text = call.getString("text", "");
        String id = call.getString("id", "u");
        String voiceId = call.getString("voice", "");
        String lang = call.getString("lang", "");
        Float rate = call.getFloat("rate", 1f);
        Float pitch = call.getFloat("pitch", 1f);
        try {
            applyVoice(voiceId, lang, rate, pitch);
            int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, new Bundle(), id);
            if (result == TextToSpeech.SUCCESS) call.resolve();
            else call.reject("Could not start speaking.");
        } catch (Exception e) {
            call.reject("Could not start speaking.");
        }
    }


    private void applyVoice(String voiceId, String lang, Float rate, Float pitch) {
        boolean voiceSet = false;
        if (voiceId != null && !voiceId.isEmpty()) {
            Set<Voice> all = tts.getVoices();
            if (all != null) {
                for (Voice v : all) {
                    if (v.getName().equals(voiceId)) {
                        voiceSet = tts.setVoice(v) == TextToSpeech.SUCCESS;
                        break;
                    }
                }
            }
        }
        if (!voiceSet && lang != null && !lang.isEmpty()) {
            int r = tts.setLanguage(Locale.forLanguageTag(lang));
            // No voice for that exact region (for example en-IN): any English voice is better than none.
            if (r < TextToSpeech.LANG_AVAILABLE) tts.setLanguage(new Locale(Locale.forLanguageTag(lang).getLanguage()));
        }
        tts.setSpeechRate(rate == null ? 1f : rate);
        tts.setPitch(pitch == null ? 1f : pitch);
    }

    private File fileFor(String id) {
        return new File(getContext().getCacheDir(), "tts-" + id.replaceAll("[^A-Za-z0-9_-]", "") + ".wav");
    }

    /** Starts saving one sentence as a WAV file. The page waits for `ttsDone`, then calls `takeFile`. */
    @PluginMethod
    public void synthesize(PluginCall call) {
        if (!ready) {
            call.reject("Text to speech is not ready.");
            return;
        }
        String id = call.getString("id", "f");
        try {
            applyVoice(call.getString("voice", ""), call.getString("lang", ""), call.getFloat("rate", 1f), 1f);
            File out = fileFor(id);
            if (out.exists()) out.delete();
            int result = tts.synthesizeToFile(call.getString("text", ""), new Bundle(), out, id);
            if (result == TextToSpeech.SUCCESS) call.resolve();
            else call.reject("Could not make the audio.");
        } catch (Exception e) {
            call.reject("Could not make the audio.");
        }
    }

    /** Hands over the saved sentence (as base64) and deletes the file. */
    @PluginMethod
    public void takeFile(PluginCall call) {
        File f = fileFor(call.getString("id", "f"));
        try {
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            try (FileInputStream in = new FileInputStream(f)) {
                byte[] chunk = new byte[16384];
                int n;
                while ((n = in.read(chunk)) > 0) buffer.write(chunk, 0, n);
            }
            byte[] bytes = buffer.toByteArray();
            if (bytes.length < 45) {
                call.reject("The phone made no audio.");
                return;
            }
            JSObject result = new JSObject();
            result.put("data", Base64.encodeToString(bytes, Base64.NO_WRAP));
            call.resolve(result);
        } catch (Exception e) {
            call.reject("The phone made no audio.");
        } finally {
            f.delete();
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (ready) tts.stop();
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
    }
}
