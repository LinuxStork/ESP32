package desktopapp;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public class SendAction {
	
	// Funkcija za slanje akcije na server
	static void sendAction(String servo, int value) {
        try {
        	// Kreiranje URLa na koji se šalju podatci
            String urlString = "http://" + Main.ipAddress + "/setServo?servo=" + servo + "&value=" + value;
            URL url = new URL(urlString);
            
            // Otvaranje konekcije s URL
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            
            // Odgovor s URLa
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                System.out.println("Sent: " + servo + " " + value);
            } else {
                System.out.println("Failed to send: " + servo + " " + value);
            }
            
            // Zatvaranje Konekcije
            connection.disconnect();
        } catch (IOException e) {
            System.out.println("Couldn't connect to IP: " + Main.ipAddress);
        }
    }
}
