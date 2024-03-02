package desktopapp;

import javax.swing.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class SerialMonitor {
    public static void serialMonitor(String port, JTextArea textArea) {
        new Thread(() -> {
            try {
                Process process = Runtime.getRuntime().exec("python python/serialmonitor.py " + port);
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

                String line;
                while ((line = reader.readLine()) != null) {
                    textArea.append(line + "\n");
                    textArea.setCaretPosition(textArea.getDocument().getLength());
                }

                int exitCode = process.waitFor();
                textArea.append("Error: Python serialMonitor exited with code " + exitCode + "\n");

            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }

    public static void serialPorts(JComboBox<String> portComboBox) {
        try {
            Process process = Runtime.getRuntime().exec("python python/serialmonitor.py");
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            String line;
            while ((line = reader.readLine()) != null) {
                portComboBox.addItem(line);
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                System.out.println("Error: Python list_ports exited with code " + exitCode);
            }

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
