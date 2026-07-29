package com.rupiyo.app;

import android.content.ContentResolver;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "RupiyoShareTarget";
    private static String pendingSharePayloadJson = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIncomingIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null) {
            Log.d(TAG, "[IMPORT] Received ACTION_SEND intent with type: " + type);

            if (type.startsWith("image/") || type.equals("application/pdf")) {
                Uri imageUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                if (imageUri != null) {
                    processSharedUri(imageUri, type);
                } else {
                    Log.w(TAG, "[IMPORT] ACTION_SEND image/pdf intent received but EXTRA_STREAM is null");
                }
            } else if (type.startsWith("text/")) {
                String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (sharedText != null && !sharedText.trim().isEmpty()) {
                    processSharedText(sharedText);
                } else {
                    Log.w(TAG, "[IMPORT] ACTION_SEND text intent received but EXTRA_TEXT is null");
                }
            }
        }
    }

    private void processSharedUri(Uri uri, String mimeType) {
        try {
            ContentResolver resolver = getContentResolver();
            InputStream inputStream = resolver.openInputStream(uri);
            if (inputStream == null) {
                Log.e(TAG, "[IMPORT] Failed to open InputStream for URI: " + uri);
                return;
            }

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            int nRead;
            byte[] data = new byte[16384];
            while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
            byte[] fileBytes = buffer.toByteArray();
            inputStream.close();

            String ext = mimeType.contains("pdf") ? ".pdf" : ".jpg";
            File tempFile = new File(getCacheDir(), "shared_receipt_import" + ext);
            FileOutputStream fos = new FileOutputStream(tempFile);
            fos.write(fileBytes);
            fos.close();

            String base64Data = Base64.encodeToString(fileBytes, Base64.NO_WRAP);

            JSObject payload = new JSObject();
            payload.put("source", "android-share");
            payload.put("kind", mimeType.contains("pdf") ? "pdf" : "image");
            payload.put("mimeType", mimeType);
            payload.put("base64", "data:" + mimeType + ";base64," + base64Data);
            payload.put("tempFilePath", tempFile.getAbsolutePath());
            payload.put("filename", tempFile.getName());
            payload.put("timestamp", System.currentTimeMillis());

            pendingSharePayloadJson = payload.toString();
            Log.d(TAG, "[IMPORT] Successfully processed shared URI. Payload size: " + fileBytes.length + " bytes");

            bridge.getWebView().post(new Runnable() {
                @Override
                public void run() {
                    bridge.getWebView().evaluateJavascript(
                        "window.__RUPIYO_PENDING_SHARE__ = " + pendingSharePayloadJson + ";" +
                        "window.dispatchEvent(new CustomEvent('rupiyo_android_share_intent', { detail: window.__RUPIYO_PENDING_SHARE__ }));",
                        null
                    );
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "[IMPORT] Exception reading content:// URI: " + e.getMessage(), e);
        }
    }

    private void processSharedText(String text) {
        JSObject payload = new JSObject();
        payload.put("source", "android-share");
        payload.put("kind", "text");
        payload.put("mimeType", "text/plain");
        payload.put("text", text);
        payload.put("timestamp", System.currentTimeMillis());

        pendingSharePayloadJson = payload.toString();
        Log.d(TAG, "[IMPORT] Successfully processed shared text snippet: " + text.substring(0, Math.min(text.length(), 40)));

        bridge.getWebView().post(new Runnable() {
            @Override
            public void run() {
                bridge.getWebView().evaluateJavascript(
                    "window.__RUPIYO_PENDING_SHARE__ = " + pendingSharePayloadJson + ";" +
                    "window.dispatchEvent(new CustomEvent('rupiyo_android_share_intent', { detail: window.__RUPIYO_PENDING_SHARE__ }));",
                    null
                );
            }
        });
    }
}
