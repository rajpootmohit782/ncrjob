package in.vmwncrjob.app;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Comparator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.json.JSONObject;

/**
 * Small, self-hosted live update plugin.
 *
 * The web app is bundled in the APK by default. This plugin can download a zip of a newer
 * `dist/` build from your own server and tell Capacitor's local web server to serve it
 * instead of the bundled assets. Only HTML/CSS/JS assets are swapped -- no native code is
 * ever downloaded, which keeps the app within Google Play's update rules.
 */
@CapacitorPlugin(name = "LiveUpdate")
public class LiveUpdatePlugin extends Plugin {

    private static final String TAG = "LiveUpdate";
    private static final String PREFS = "live_update";
    private static final String KEY_APPLIED_VERSION = "applied_version";
    private static final String KEY_APPLIED_PATH = "applied_path";
    private static final String KEY_APPLIED_SHA = "applied_sha256";
    private static final String KEY_LAST_GOOD_VERSION = "last_good_version";
    private static final String KEY_LAST_GOOD_PATH = "last_good_path";
    private static final String KEY_PENDING_VERSION = "pending_version";
    private static final String KEY_PENDING_PATH = "pending_path";
    private static final String KEY_PENDING_SHA = "pending_sha256";
    private static final String DEFAULT_MANIFEST_URL = "https://vmwncrjob.in/app-update.json";
    private static final long MAX_BUNDLE_BYTES = 30L * 1024 * 1024;
    private static final int MAX_ENTRIES = 2000;

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final Object LOCK = new Object();

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static File updatesRoot(Context context) {
        File dir = new File(context.getFilesDir(), "live-update");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }

    private static boolean isUsableBundle(File dir) {
        if (dir == null || !dir.isDirectory()) {
            return false;
        }
        File index = new File(dir, "index.html");
        return index.isFile() && index.length() > 0;
    }

    /**
     * Called from MainActivity before the WebView is used. Applies a downloaded bundle that
     * was staged on a previous run, and rolls back a bundle that never reached "app ready".
     */
    public static void applyStoredBundle(Bridge bridge) {
        Context context = bridge.getContext();
        SharedPreferences p = prefs(context);

        long applied = p.getLong(KEY_APPLIED_VERSION, 0);
        long lastGood = p.getLong(KEY_LAST_GOOD_VERSION, 0);

        // A restored backup can leave a version recorded whose files are gone.
        if (applied != 0) {
            String appliedPath = p.getString(KEY_APPLIED_PATH, "");
            if (appliedPath.isEmpty() || !isUsableBundle(new File(appliedPath))) {
                bridge.setServerAssetPath("public");
                p.edit()
                        .remove(KEY_APPLIED_VERSION)
                        .remove(KEY_APPLIED_PATH)
                        .remove(KEY_APPLIED_SHA)
                        .remove(KEY_LAST_GOOD_VERSION)
                        .remove(KEY_LAST_GOOD_PATH)
                        .apply();
                applied = 0;
                lastGood = 0;
            }
        }

        if (applied != 0 && lastGood != 0 && applied != lastGood) {
            // The previously applied bundle never signalled ready -- fall back.
            String goodPath = p.getString(KEY_LAST_GOOD_PATH, "");
            File goodDir = new File(goodPath);
            if (!goodPath.isEmpty() && isUsableBundle(goodDir)) {
                bridge.setServerBasePath(goodDir.getAbsolutePath());
                p.edit().putLong(KEY_APPLIED_VERSION, lastGood).putString(KEY_APPLIED_PATH, goodPath).apply();
            } else {
                bridge.setServerAssetPath("public");
                p.edit()
                        .remove(KEY_APPLIED_VERSION)
                        .remove(KEY_APPLIED_PATH)
                        .remove(KEY_APPLIED_SHA)
                        .apply();
            }
            return;
        }

        long pending = p.getLong(KEY_PENDING_VERSION, 0);
        String pendingPath = p.getString(KEY_PENDING_PATH, "");
        if (pending > applied && !pendingPath.isEmpty()) {
            File dir = new File(pendingPath);
            if (isUsableBundle(dir)) {
                bridge.setServerBasePath(dir.getAbsolutePath());
                p.edit()
                        .putLong(KEY_APPLIED_VERSION, pending)
                        .putString(KEY_APPLIED_PATH, pendingPath)
                        .putString(KEY_APPLIED_SHA, p.getString(KEY_PENDING_SHA, ""))
                        .remove(KEY_PENDING_VERSION)
                        .remove(KEY_PENDING_PATH)
                        .remove(KEY_PENDING_SHA)
                        .apply();
            } else {
                p.edit().remove(KEY_PENDING_VERSION).remove(KEY_PENDING_PATH).remove(KEY_PENDING_SHA).apply();
            }
        }
    }

    private String manifestUrl() {
        return getBridge()
                .getConfig()
                .getPluginConfiguration("LiveUpdate")
                .getString("manifestUrl", DEFAULT_MANIFEST_URL);
    }

    @PluginMethod
    public void info(PluginCall call) {
        SharedPreferences p = prefs(getContext());
        JSObject ret = new JSObject();
        ret.put("appliedVersion", p.getLong(KEY_APPLIED_VERSION, 0));
        ret.put("pendingVersion", p.getLong(KEY_PENDING_VERSION, 0));
        ret.put("usingDownloadedBundle", !p.getString(KEY_APPLIED_PATH, "").isEmpty());
        ret.put("manifestUrl", manifestUrl());
        call.resolve(ret);
    }

    /** Confirm the current bundle rendered successfully so rollback knows it is safe. */
    @PluginMethod
    public void markReady(PluginCall call) {
        SharedPreferences p = prefs(getContext());
        p.edit()
                .putLong(KEY_LAST_GOOD_VERSION, p.getLong(KEY_APPLIED_VERSION, 0))
                .putString(KEY_LAST_GOOD_PATH, p.getString(KEY_APPLIED_PATH, ""))
                .apply();
        call.resolve();
    }

    /** Check the manifest and stage a newer bundle for the NEXT app start. */
    @PluginMethod
    public void sync(PluginCall call) {
        executor.execute(() -> {
            synchronized (LOCK) {
                try {
                    JSObject result = doSync();
                    call.resolve(result);
                } catch (Exception ex) {
                    call.reject("Live update failed: " + ex.getMessage());
                }
            }
        });
    }

    private JSObject doSync() throws Exception {
        SharedPreferences p = prefs(getContext());
        long applied = p.getLong(KEY_APPLIED_VERSION, 0);
        long pending = p.getLong(KEY_PENDING_VERSION, 0);
        long known = Math.max(applied, pending);

        String manifestJson = fetch(manifestUrl(), 200_000);
        JSONObject manifest = new JSONObject(manifestJson);
        long remoteVersion = manifest.optLong("version", 0);
        String remoteSha = manifest.optString("sha256", "");
        String path = manifest.optString("url", "app-update.zip");
        long declaredSize = manifest.optLong("size", 0);

        JSObject status = new JSObject();
        status.put("version", remoteVersion);

        if (remoteVersion <= 0 || remoteSha.isEmpty()) {
            status.put("available", false);
            status.put("reason", "invalid-manifest");
            return status;
        }
        // Identical contents with a newer build timestamp do not need a download.
        String appliedSha = p.getString(KEY_APPLIED_SHA, "");
        if (!appliedSha.isEmpty() && appliedSha.equalsIgnoreCase(remoteSha)) {
            status.put("available", false);
            status.put("reason", "up-to-date");
            return status;
        }
        if (remoteVersion <= known) {
            status.put("available", false);
            status.put("reason", "up-to-date");
            return status;
        }

        URL zipUrl = new URL(new URL(manifestUrl()), path);
        File root = updatesRoot(getContext());
        File download = new File(root, "download.tmp");
        byte[] bytes = fetchBytes(zipUrl, declaredSize);
        String actualSha = sha256(bytes);
        if (!remoteSha.equalsIgnoreCase(actualSha)) {
            status.put("available", false);
            status.put("reason", "checksum-mismatch");
            return status;
        }

        try (OutputStream out = new FileOutputStream(download)) {
            out.write(bytes);
        }

        File staging = new File(root, "staging");
        deleteRecursively(staging);
        if (!staging.mkdirs()) {
            throw new IOException("Could not create staging directory");
        }
        int count = unzip(download, staging);
        if (!isUsableBundle(staging)) {
            deleteRecursively(staging);
            status.put("available", false);
            status.put("reason", "invalid-bundle");
            return status;
        }

        File target = new File(root, "v" + remoteVersion);
        deleteRecursively(target);
        if (!staging.renameTo(target)) {
            throw new IOException("Could not install bundle v" + remoteVersion);
        }
        if (!download.delete()) {
            // Non-fatal: leftover temp file will be overwritten next time.
        }

        p.edit()
                .putLong(KEY_PENDING_VERSION, remoteVersion)
                .putString(KEY_PENDING_PATH, target.getAbsolutePath())
                .putString(KEY_PENDING_SHA, actualSha)
                .apply();

        cleanOldBundles(root, applied, p.getLong(KEY_LAST_GOOD_VERSION, 0), remoteVersion);

        status.put("available", true);
        status.put("reason", "downloaded");
        status.put("files", count);
        return status;
    }

    /** Remove the downloaded bundle and go back to the version shipped in the APK. */
    @PluginMethod
    public void reset(PluginCall call) {
        prefs(getContext()).edit().clear().apply();
        deleteRecursively(updatesRoot(getContext()));
        getBridge().setServerAssetPath("public");
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }

    private static void cleanOldBundles(File root, long applied, long lastGood, long pending) {
        File[] dirs = root.listFiles();
        if (dirs == null) {
            return;
        }
        for (File dir : dirs) {
            if (!dir.isDirectory() || !dir.getName().startsWith("v")) {
                continue;
            }
            try {
                long v = Long.parseLong(dir.getName().substring(1));
                if (v != applied && v != lastGood && v != pending) {
                    deleteRecursively(dir);
                }
            } catch (NumberFormatException ignored) {
                deleteRecursively(dir);
            }
        }
    }

    private static String fetch(String urlString, int limit) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(urlString).openConnection();
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(15_000);
        conn.setRequestMethod("GET");
        conn.setInstanceFollowRedirects(true);
        try {
            int code = conn.getResponseCode();
            if (code < 200 || code >= 300) {
                throw new IOException("HTTP " + code + " for " + urlString);
            }
            return new String(readAll(conn.getInputStream(), limit), StandardCharsets.UTF_8);
        } finally {
            conn.disconnect();
        }
    }

    private static byte[] fetchBytes(URL url, long declaredSize) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(20_000);
        conn.setRequestMethod("GET");
        conn.setInstanceFollowRedirects(true);
        try {
            int code = conn.getResponseCode();
            if (code < 200 || code >= 300) {
                throw new IOException("HTTP " + code + " for " + url);
            }
            int limit = declaredSize > 0 && declaredSize < MAX_BUNDLE_BYTES
                    ? (int) declaredSize
                    : (int) MAX_BUNDLE_BYTES;
            byte[] data = readAll(conn.getInputStream(), limit);
            if (data.length == 0) {
                throw new IOException("Empty update bundle");
            }
            return data;
        } finally {
            conn.disconnect();
        }
    }

    private static byte[] readAll(InputStream in, int limit) throws IOException {
        try (BufferedInputStream buffered = new BufferedInputStream(in)) {
            byte[] buffer = new byte[8192];
            byte[] result = new byte[0];
            int total = 0;
            int n;
            while ((n = buffered.read(buffer)) != -1) {
                if (total + n > limit) {
                    throw new IOException("Update bundle exceeds size limit");
                }
                byte[] next = new byte[total + n];
                System.arraycopy(result, 0, next, 0, total);
                System.arraycopy(buffer, 0, next, total, n);
                result = next;
                total += n;
            }
            return result;
        }
    }

    private static int unzip(File zip, File destination) throws IOException {
        int entries = 0;
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zip))) {
            ZipEntry entry;
            byte[] buffer = new byte[8192];
            while ((entry = zis.getNextEntry()) != null) {
                entries++;
                if (entries > MAX_ENTRIES) {
                    throw new IOException("Update bundle has too many files");
                }
                String name = entry.getName().replace('\\', '/');
                if (name.startsWith("/") || name.contains("..")) {
                    throw new IOException("Unsafe path in update bundle: " + name);
                }
                File out = new File(destination, name);
                if (entry.isDirectory()) {
                    if (!out.mkdirs() && !out.isDirectory()) {
                        throw new IOException("Could not create directory " + name);
                    }
                    continue;
                }
                File parent = out.getParentFile();
                if (parent != null && !parent.mkdirs() && !parent.isDirectory()) {
                    throw new IOException("Could not create directory for " + name);
                }
                try (OutputStream os = new FileOutputStream(out)) {
                    int n;
                    while ((n = zis.read(buffer)) != -1) {
                        os.write(buffer, 0, n);
                    }
                }
                zis.closeEntry();
            }
        }
        return entries;
    }

    private static void deleteRecursively(File file) {
        if (file == null || !file.exists()) {
            return;
        }
        File[] children = file.listFiles();
        if (children != null) {
            for (File child : children) {
                deleteRecursively(child);
            }
        }
        if (!file.delete()) {
            LoggerWarn("Could not delete " + file.getAbsolutePath());
        }
    }

    private static void LoggerWarn(String message) {
        android.util.Log.w(TAG, message);
    }

    private static String sha256(byte[] bytes) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(bytes);
        StringBuilder sb = new StringBuilder(hash.length * 2);
        for (byte b : hash) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }
}
