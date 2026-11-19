package com.igorswift.shadowingplayer;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.AssetFileDescriptor;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.webkit.*;
import android.view.WindowManager;
import androidx.webkit.WebViewAssetLoader;
import com.google.mlkit.nl.translate.*;
import com.google.mlkit.common.model.DownloadConditions;
import org.json.*;
import java.io.*;
import java.util.*;

public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String ORIGIN = "https://" + HOST;
    private WebView web;
    private Translator translator;
    private volatile Uri pendingMedia, pendingJson, playbackDocument;
    private PermissionRequest microphone;
    private final Map<String, String> translations = new HashMap<>();

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        setContentView(web);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setBlockNetworkLoads(false);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return !HOST.equals(req.getUrl().getHost());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri url = req.getUrl();
                if (url.toString().startsWith("blob:" + ORIGIN + "/")) return null;
                if (!HOST.equals(url.getHost()) || !"https".equals(url.getScheme())) {
                    return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden",
                        Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
                }
                return loader.shouldInterceptRequest(url);
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (url.equals(ORIGIN + "/assets/continuous.html")) {
                    view.evaluateJavascript("(()=>{const s=document.createElement('script');s.src='/assets/android.js';document.head.append(s)})()", null);
                }
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                Uri file = playbackDocument;
                playbackDocument = null;
                boolean allowed = (ORIGIN + "/assets/continuous.html").equals(view.getUrl())
                        && file != null && "content".equals(file.getScheme());
                callback.onReceiveValue(allowed ? new Uri[]{file} : null);
                return true;
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (!ORIGIN.equals(request.getOrigin().toString()) && !(ORIGIN + "/").equals(request.getOrigin().toString())) {
                        request.deny(); return;
                    }
                    if (!Arrays.asList(request.getResources()).contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                        request.deny(); return;
                    }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED)
                        request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    else {
                        microphone = request;
                        requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 5);
                    }
                });
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) {
                if (microphone == request) microphone = null;
            }
        });
        web.addJavascriptInterface(new Bridge(), "AndroidPlayer");
        web.loadUrl(ORIGIN + "/assets/continuous.html");
    }

    private JSONArray library() {
        try { return new JSONArray(getPreferences(MODE_PRIVATE).getString("library", "[]")); }
        catch (JSONException e) { return new JSONArray(); }
    }
    private void saveLibrary(JSONArray rows) {
        getPreferences(MODE_PRIVATE).edit().putString("library", rows.toString()).apply();
    }
    private JSONObject item(String id) throws JSONException {
        JSONArray rows = library();
        for (int i=0; i<rows.length(); i++) {
            JSONObject row = rows.getJSONObject(i);
            if (row.getString("id").equals(id)) return row;
        }
        throw new JSONException("File is no longer in the library");
    }
    private String fileName(Uri uri) {
        try (Cursor cursor = getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)) {
            if (cursor != null && cursor.moveToFirst()) return cursor.getString(0);
        } catch (Exception ignored) {}
        return "Media";
    }
    private void pick(String type, int code) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(type);
        if (code == 1) {
            intent.setType("*/*");
            intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"video/*","audio/*"});
        }
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(intent, code);
    }
    private void notifyPage(String function, String argument) {
        runOnUiThread(() -> web.evaluateJavascript(function + "(" + JSONObject.quote(argument) + ")", null));
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (result != RESULT_OK || data == null || data.getData() == null) {
            return;
        }
        Uri uri = data.getData();
        try {
            getContentResolver().takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            if (request == 1) pendingMedia = uri;
            else if (request == 2) pendingJson = uri;
            else return;
            notifyPage(request == 1 ? "androidVideoChosen" : "androidJsonChosen", fileName(uri));
        } catch (Exception e) { notifyPage("androidError", e.getMessage() == null ? "Cannot access file" : e.getMessage()); }
    }
    public class Bridge {
        @JavascriptInterface public String list() { return library().toString(); }
        @JavascriptInterface public void chooseVideo() { runOnUiThread(() -> pick("*/*", 1)); }
        @JavascriptInterface public void chooseJson() { runOnUiThread(() -> pick("*/*", 2)); }
        @JavascriptInterface public String openSelected() {
            if (pendingMedia == null || pendingJson == null) return "";
            try {
                JSONObject row = new JSONObject();
                row.put("id", UUID.randomUUID().toString());
                row.put("name", fileName(pendingMedia));
                row.put("type", Optional.ofNullable(getContentResolver().getType(pendingMedia)).orElse("video/mp4"));
                row.put("media", pendingMedia.toString());
                row.put("json", pendingJson.toString());
                JSONArray rows = library();
                rows.put(row); saveLibrary(rows);
                pendingMedia = pendingJson = null;
                return row.getString("id");
            } catch (Exception e) { return ""; }
        }
        @JavascriptInterface public boolean preparePlayback(String id) {
            playbackDocument = null;
            try {
                Uri uri = Uri.parse(item(id).getString("media"));
                try (AssetFileDescriptor afd = getContentResolver().openAssetFileDescriptor(uri, "r")) {
                    if (afd == null) return false;
                }
                playbackDocument = uri;
                return true;
            } catch (Exception e) { return false; }
        }
        @JavascriptInterface public String transcript(String id) {
            try (InputStream in = getContentResolver().openInputStream(Uri.parse(item(id).getString("json")))) {
                if (in == null) throw new IOException("Transcript unavailable");
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                byte[] buffer = new byte[8192];
                for (int n; (n=in.read(buffer)) != -1;) {
                    if (out.size()+n > 32*1024*1024) throw new IOException("Transcript is too large");
                    out.write(buffer,0,n);
                }
                return out.toString("UTF-8");
            } catch (Exception e) { return ""; }
        }
        @JavascriptInterface public void remove(String id) {
            JSONArray old = library(), rows = new JSONArray();
            for (int i=0;i<old.length();i++) {
                JSONObject row=old.optJSONObject(i);
                if (row != null && !id.equals(row.optString("id"))) rows.put(row);
            }
            saveLibrary(rows);
        }
        @JavascriptInterface public void translate(String text, String requestId) {
            runOnUiThread(() -> {
                if (text.length()>10000) return;
                if (translations.containsKey(text)) {
                    translated(requestId, translations.get(text), ""); return;
                }
                if (translator == null) translator = Translation.getClient(new TranslatorOptions.Builder()
                    .setSourceLanguage(TranslateLanguage.ENGLISH).setTargetLanguage(TranslateLanguage.RUSSIAN).build());
                translator.downloadModelIfNeeded(new DownloadConditions.Builder().build())
                    .continueWithTask(task -> { if (!task.isSuccessful()) throw task.getException(); return translator.translate(text); })
                    .addOnSuccessListener(russian -> { translations.put(text,russian); translated(requestId,russian,""); })
                    .addOnFailureListener(error -> translated(requestId,"","Translation unavailable. Connect to the internet to download the language model."));
            });
        }
    }
    private void translated(String id, String text, String error) {
        runOnUiThread(() -> web.evaluateJavascript("androidTranslated("+JSONObject.quote(id)+","+JSONObject.quote(text)+","+JSONObject.quote(error)+")",null));
    }
    @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results) {
        super.onRequestPermissionsResult(code,permissions,results);
        if (code==5 && microphone!=null) {
            if (results.length>0 && results[0]==PackageManager.PERMISSION_GRANTED)
                microphone.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            else microphone.deny();
            microphone=null;
        }
    }
    @Override protected void onPause() {
        super.onPause();
        web.evaluateJavascript("window.androidSaveProgress && androidSaveProgress(); if(typeof video!=='undefined' && video) video.pause()",null);
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("window.androidGoHome && androidGoHome()",null);
    }
    @Override protected void onDestroy() {
        if (translator != null) translator.close();
        web.destroy();
        super.onDestroy();
    }
}
