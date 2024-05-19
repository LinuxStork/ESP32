package desktopapp;

import javax.swing.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class SerialMonitor {
	
	// Funkcija za seriski monitor
    public static void serialMonitor(String port, JTextArea textArea) {
    	// Pokretanje novog threada kako bi se seriski monitor mogao izvršavati u pozadini
        new Thread(() -> {
            try {
            	// Pokretanje python skripte za seriski monitor
                Process process = Runtime.getRuntime().exec("python python/serialmonitor.py " + port);
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

                String line;
                // Čitanje ispisa python skripte i prikazivanje u textu u aplikaciji
                while ((line = reader.readLine()) != null) {
                    textArea.append(line + "\n");
                    textArea.setCaretPosition(textArea.getDocument().getLength());
                }
                
                int exitCode = process.waitFor();
                // Ako python skripta završi s greška se prikazuje u aplikaciji
                textArea.append("Error: Python serialMonitor exited with code " + exitCode + "\n");

            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
    // Funkcija za dobivanje poipisa seriskih portova
    public static void serialPorts(JComboBox<String> portComboBox) {
        try {
            // POkretanje python skripte za dobivanje popisa serijskih portova
            Process process = Runtime.getRuntime().exec("python python/serialmonitor.py");
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            String line;
            // ČItanje ispisa python skripte i prikazivanje u izborniku za odabit seriskih portova
            while ((line = reader.readLine()) != null) {
                portComboBox.addItem(line);
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
            	// Ako python skripta završi s greška se prikazuje u aplikaciji
                System.out.println("Error: Python list_ports exited with code " + exitCode);
            }

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
