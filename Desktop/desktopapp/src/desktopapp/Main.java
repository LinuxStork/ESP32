package desktopapp;

import javax.swing.*;
import java.awt.*;

public class Main {
    public static String ipAddress;

	public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
        	// Inicializacija JFramea
            JFrame frame = new JFrame("ESP32: Robotska ruka");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setSize(1280, 720);
            frame.setLayout(new GridLayout(1, 1));

            // Kreiranje panela
            JPanel slidersPanel = new JPanel();
            slidersPanel.setLayout(new BorderLayout());

            // Unos IP adrese
            JPanel ipPanel = new JPanel();
            JLabel ipLabel = new JLabel("IP Address:");
            JTextField ipTextField = new JTextField(15);
            ipPanel.add(ipLabel);
            ipPanel.add(ipTextField);
            
         // Gumb za postavljanje IP adrese
            JButton setIPButton = new JButton("Set IP");
            setIPButton.addActionListener(e -> {
                ipAddress = ipTextField.getText();
                SendAction.sendAction("restart", 0);
            });
            ipPanel.add(setIPButton);

            slidersPanel.add(ipPanel, BorderLayout.NORTH);

            // Kreiranje Panelaa za klizače
            JPanel slidersInnerPanel = new JPanel();
            slidersInnerPanel.setLayout(new GridLayout(7, 1));

            // Niz za imena klizača
            String[] sliderNames = {"base", "shoulder", "upperArm", "hand", "gripper", "gripperTop"};
            for (String sliderName : sliderNames) {
                JPanel sliderWithLabel = new JPanel(new BorderLayout());
                
                // Oznaka za klizač
                JLabel sliderLabel = new JLabel(sliderName, SwingConstants.CENTER);
                sliderWithLabel.add(sliderLabel, BorderLayout.PAGE_START);
                
                // Kreiranje klizača
                JSlider slider = new JSlider(JSlider.HORIZONTAL, -90, 90, 0);
                slider.setMajorTickSpacing(30);
                slider.setMinorTickSpacing(10);
                slider.setPaintTicks(true);
                slider.setPaintLabels(true);
                
                // Listener za pomak klizača
                slider.addChangeListener(e -> {
                	// Slanje pozicije klizača u SendAction
                	SendAction.sendAction(sliderName, slider.getValue());
                });

                sliderWithLabel.add(slider, BorderLayout.CENTER);

                slidersInnerPanel.add(sliderWithLabel);
            }
            slidersPanel.add(slidersInnerPanel, BorderLayout.CENTER);
            frame.add(slidersPanel);
            
            // Kreiranje panela za (save, play, restart) gumbe
            JPanel buttonPanel = new JPanel();
            JButton saveButton = new JButton("Save");
            JButton playButton = new JButton("Play");
            JButton restartButton = new JButton("Restart");

            // Listeneri za gumbe
            saveButton.addActionListener(e -> {
            	SendAction.sendAction("save", 0);
            });

            playButton.addActionListener(e -> {
            	SendAction.sendAction("play", 0);
            });

            restartButton.addActionListener(e -> {
            	SendAction.sendAction("restart", 0);
            });

            buttonPanel.add(saveButton);
            buttonPanel.add(playButton);
            buttonPanel.add(restartButton);

            slidersPanel.add(buttonPanel, BorderLayout.SOUTH);

            frame.add(slidersPanel);

            // Panel za seriski monitor
            JPanel serialMonitorPanel = new JPanel(new BorderLayout());
            JTextArea textArea = new JTextArea();
            textArea.setEditable(false);
            JScrollPane scrollPane = new JScrollPane(textArea);
            serialMonitorPanel.add(scrollPane, BorderLayout.CENTER);

            // Izbornik za odabit seriskih portova
            JComboBox<String> portComboBox = new JComboBox<>();
            SerialMonitor.serialPorts(portComboBox);

            serialMonitorPanel.add(portComboBox, BorderLayout.NORTH);

            // Gumb za pokretanje seriskog monitora
            JButton startButton = new JButton("Start");
            startButton.addActionListener(e -> {
                String selectedPort = (String) portComboBox.getSelectedItem();
                SerialMonitor.serialMonitor(selectedPort, textArea);
            });
            serialMonitorPanel.add(startButton, BorderLayout.SOUTH);

            frame.add(serialMonitorPanel);

            frame.setVisible(true);
        });
    }
}