package com.saksolution.expensetracker;

import android.Manifest;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import org.json.JSONException;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(
    name = "SmsReader",
    permissions = {
        @Permission(strings = { Manifest.permission.READ_SMS }, alias = "sms")
    }
)
public class SmsReaderPlugin extends Plugin {

    private static final int REQUEST_SMS_PERMISSION = 100;

    @PluginMethod
    public void checkPermission(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS) 
            == PackageManager.PERMISSION_GRANTED) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", false);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS) 
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                getActivity(),
                new String[]{Manifest.permission.READ_SMS},
                REQUEST_SMS_PERMISSION
            );
            // Save the call to resolve later
            bridge.saveCall(call);
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void getRecentSms(PluginCall call) {
        // Check permission first
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS) 
            != PackageManager.PERMISSION_GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }

        try {
            Integer days = call.getInt("days", 7);
            List<String> keywords = new ArrayList<>();
            keywords.add("debited");
            keywords.add("credited");
            keywords.add("paid");
            keywords.add("spent");
            keywords.add("withdrawn");
            keywords.add("payment");
            keywords.add("txn");
            keywords.add("transaction");
            keywords.add("purchase");
            keywords.add("upi");
            keywords.add("inr");
            keywords.add("rs");
            keywords.add("₹");

            JSArray messages = new JSArray();
            Uri uri = Telephony.Sms.CONTENT_URI;
            String[] projection = new String[]{"_id", "address", "body", "date"};
            
            // Calculate timestamp for X days ago
            long daysAgo = System.currentTimeMillis() - (days * 24 * 60 * 60 * 1000L);
            String selection = "date >= ?";
            String[] selectionArgs = new String[]{String.valueOf(daysAgo)};
            
            Cursor cursor = getContext().getContentResolver().query(
                uri,
                projection,
                selection,
                selectionArgs,
                "date DESC LIMIT 100"
            );

            if (cursor != null) {
                while (cursor.moveToNext()) {
                    String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
                    String address = cursor.getString(cursor.getColumnIndexOrThrow("address"));
                    long date = cursor.getLong(cursor.getColumnIndexOrThrow("date"));
                    
                    // Filter for transaction SMS
                    String bodyLower = body.toLowerCase();
                    boolean isTransaction = false;
                    for (String keyword : keywords) {
                        if (bodyLower.contains(keyword)) {
                            isTransaction = true;
                            break;
                        }
                    }
                    
                    if (isTransaction) {
                        JSObject sms = new JSObject();
                        sms.put("sender", address);
                        sms.put("body", body);
                        sms.put("date", date);
                        messages.put(sms);
                    }
                }
                cursor.close();
            }

            JSObject ret = new JSObject();
            ret.put("messages", messages);
            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Error reading SMS: " + e.getMessage());
        }
    }
}
