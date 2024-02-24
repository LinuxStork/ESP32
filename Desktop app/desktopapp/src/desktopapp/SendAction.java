package desktopapp;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public class SendAction {
	
	static void sendAction(String servo, int value) {
        try {
            String urlString = "http://" + Main.ipAddress + "/setServo?servo=" + servo + "&value=" + value;
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                System.out.println("Sent: " + servo + " " + value);
            } else {
                System.out.println("Failed to send: " + servo + " " + value);
            }

            connection.disconnect();
        } catch (IOException e) {
            System.out.println("Couldn't connect to IP: " + Main.ipAddress);
        }
    }
}
